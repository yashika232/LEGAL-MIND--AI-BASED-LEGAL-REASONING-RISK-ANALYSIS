from utils.llm import is_groq_available
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from models import db, User, Case
from config import *
import os, json
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
app.config['JWT_SECRET_KEY'] = JWT_SECRET_KEY
app.config['SECRET_KEY'] = SECRET_KEY
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

CORS(app, resources={r"/*": {"origins": "*"}})
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
db.init_app(app)

with app.app_context():
    db.create_all()

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ─── AUTH ────────────────────────────────────────────────
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already registered"}), 400
    hashed = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
    user = User(name=data.get("name", ""), email=data["email"], password=hashed)
    db.session.add(user)
    db.session.commit()
    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.to_dict()})

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(email=data["email"]).first()
    if not user or not bcrypt.check_password_hash(user.password, data["password"]):
        return jsonify({"error": "Invalid credentials"}), 401
    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.to_dict()})

@app.route("/me", methods=["GET"])
@jwt_required()
def me():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict())

# ─── CASES ───────────────────────────────────────────────
@app.route("/cases", methods=["GET"])
@jwt_required()
def get_cases():
    user_id = int(get_jwt_identity())
    cases = Case.query.filter_by(user_id=user_id).order_by(Case.created_at.desc()).all()
    return jsonify([c.to_dict() for c in cases])

@app.route("/cases/<int:case_id>", methods=["GET"])
@jwt_required()
def get_case(case_id):
    case = Case.query.get_or_404(case_id)
    return jsonify(case.to_dict())

@app.route("/cases", methods=["POST"])
@jwt_required()
def create_case():
    user_id = int(get_jwt_identity())
    data = request.json
    case = Case(
        user_id=user_id,
        title=data.get("title", "New Case"),
        case_type=data.get("case_type", "civil"),
        description=data.get("description", ""),
        parties=data.get("parties", ""),
        court=data.get("court", ""),
        status="analyzing"
    )
    db.session.add(case)
    db.session.commit()
    return jsonify(case.to_dict())

@app.route("/cases/<int:case_id>/upload", methods=["POST"])
@jwt_required()
def upload_documents(case_id):
    case = Case.query.get_or_404(case_id)
    files = request.files.getlist("documents")
    saved = []

    case_upload_dir = os.path.join(UPLOAD_FOLDER, str(case_id))
    os.makedirs(case_upload_dir, exist_ok=True)

    for f in files:
        fname = secure_filename(f.filename)
        fpath = os.path.join(case_upload_dir, fname)
        f.save(fpath)
        saved.append(fname)

    existing = json.loads(case.documents or "[]")
    case.documents = json.dumps(existing + saved)
    db.session.commit()
    return jsonify({"uploaded": saved, "case": case.to_dict()})

@app.route("/cases/<int:case_id>/analyze", methods=["POST"])
@jwt_required()
def analyze_case(case_id):
    case = Case.query.get_or_404(case_id)

    case_upload_dir = os.path.join(UPLOAD_FOLDER, str(case_id))
    file_paths = []
    docs = json.loads(case.documents or "[]")
    for fname in docs:
        fpath = os.path.join(case_upload_dir, fname)
        if os.path.exists(fpath):
            file_paths.append(fpath)

    all_text = ""

    try:
        from rag.ingest import ingest_case
        all_text, rag_ok = ingest_case(case_id, file_paths)
        case.rag_ready = rag_ok
    except Exception as e:
        print(f"Ingest error: {e}")

    try:
        from utils.summarizer import summarize
        analysis = summarize(all_text or case.description, case.case_type)
        case.summary = analysis.get("summary", "")
        case.risk_score = analysis.get("risk_score", 50)
        case.risk_factors = json.dumps(analysis.get("risk_factors", []))
        case.precedents = json.dumps(analysis.get("precedents", []))
    except Exception as e:
        print(f"Summarize error: {e}")
        case.risk_score = 50
        case.risk_factors = json.dumps([])

    try:
        from utils.kanoon_scraper import search_indian_kanoon, build_query
        query = build_query(case.case_type, case.description)
        judgements = search_indian_kanoon(query, max_results=5)
        case.similar_judgements = json.dumps(judgements)
    except Exception as e:
        print(f"Kanoon scrape error: {e}")
        case.similar_judgements = json.dumps([])

    case.status = "active"
    db.session.commit()
    return jsonify(case.to_dict())

# ─── RAG CHAT ─────────────────────────────────────────────
@app.route("/cases/<int:case_id>/chat/history", methods=["GET"])
@jwt_required()
def get_chat_history(case_id):
    user_id = int(get_jwt_identity())
    from models import ChatMessage
    msgs = (ChatMessage.query
            .filter_by(case_id=case_id, user_id=user_id)
            .order_by(ChatMessage.created_at.asc())
            .all())
    return jsonify([m.to_dict() for m in msgs])


@app.route("/cases/<int:case_id>/chat/history", methods=["DELETE"])
@jwt_required()
def clear_chat_history(case_id):
    user_id = int(get_jwt_identity())
    from models import ChatMessage
    ChatMessage.query.filter_by(case_id=case_id, user_id=user_id).delete()
    db.session.commit()
    return jsonify({"cleared": True})


@app.route("/cases/<int:case_id>/chat", methods=["POST"])
@jwt_required()
def rag_chat(case_id):
    user_id = int(get_jwt_identity())
    query   = request.json["query"]

    from models import ChatMessage

    # Persist the user message immediately
    db.session.add(ChatMessage(case_id=case_id, user_id=user_id, role="user", content=query))
    db.session.commit()

    # Build recent conversation history (last 10 turns, excluding current)
    recent = (ChatMessage.query
              .filter_by(case_id=case_id, user_id=user_id)
              .order_by(ChatMessage.created_at.desc())
              .limit(11).all())
    recent.reverse()
    history_text = ""
    for m in recent[:-1]:   # exclude the message we just added
        prefix = "Lawyer" if m.role == "user" else "Assistant"
        history_text += f"{prefix}: {m.content}\n"

    def generate():
        full_response = ""
        try:
            from rag.langchain_rag import ask
            response = ask(case_id, query, history=history_text)
            for word in response.split():
                full_response += word + " "
                yield word + " "
        except Exception as e:
            full_response = f"Error: {str(e)}"
            yield full_response

        # Persist assistant reply after streaming completes.
        # Remove the stale scoped session before opening a fresh context.
        with app.app_context():
            db.session.remove()
            try:
                db.session.add(ChatMessage(
                    case_id=case_id, user_id=user_id,
                    role="assistant", content=full_response.strip()
                ))
                db.session.commit()
            except Exception as e:
                print(f"[Chat] Failed to persist assistant message: {e}")
                db.session.rollback()

    return Response(generate(), mimetype="text/plain")


@app.route("/draft/document-types/<case_type>", methods=["GET"])
@jwt_required()
def get_case_document_types(case_type):
    from utils.document_drafter import get_filtered_document_types
    return jsonify(get_filtered_document_types(case_type))

@app.route("/cases/<int:case_id>", methods=["DELETE"])
@jwt_required()
def delete_case(case_id):
    case = Case.query.get_or_404(case_id)
    db.session.delete(case)
    db.session.commit()
    return jsonify({"message":"Case deleted successfully"})

# ─── DOCUMENT DRAFTER ─────────────────────────────────────
@app.route("/draft/document-types", methods=["GET"])
@jwt_required()
def get_document_types():
    """Return all available document types grouped by category."""
    from utils.document_drafter import get_document_types_list
    return jsonify(get_document_types_list())

@app.route("/draft/generate", methods=["POST"])
@jwt_required()
def generate_draft():
    """
    Generate a legal document draft.
    Body: { doc_type, fields: {}, case_id (optional) }
    """
    data = request.json
    doc_type = data.get("doc_type")
    fields = data.get("fields", {})
    case_id = data.get("case_id")

    if not doc_type:
        return jsonify({"error": "doc_type is required"}), 400

    # Optionally pull RAG context from the case documents
    case_context = ""
    if case_id:
        try:
            from rag.langchain_rag import get_chain
            from langchain_community.vectorstores import FAISS
            from langchain_huggingface import HuggingFaceEmbeddings
            from config import GEMINI_API_KEY
            import os

            RAG_BASE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "rag_data")
            case_dir = os.path.join(RAG_BASE_DIR, str(case_id))
            index_path = os.path.join(case_dir, "index.faiss")

            if os.path.exists(index_path):
                emb = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
                vs = FAISS.load_local(case_dir, emb, allow_dangerous_deserialization=True)
                # Retrieve top context chunks related to the document type
                query = f"facts parties dispute {doc_type.replace('_', ' ')}"
                docs = vs.similarity_search(query, k=4)
                case_context = "\n\n".join(d.page_content for d in docs)
        except Exception as e:
            print(f"[Draft] Context retrieval error: {e}")

    try:
        from utils.document_drafter import draft_document
        draft = draft_document(doc_type, fields, case_context)
        return jsonify({"draft": draft, "doc_type": doc_type})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ─── DASHBOARD STATS ────────────────────────────────────────
@app.route("/stats", methods=["GET"])
@jwt_required()
def stats():
    user_id = int(get_jwt_identity())
    cases = Case.query.filter_by(user_id=user_id).all()
    total = len(cases)
    active = sum(1 for c in cases if c.status == "active")
    closed = sum(1 for c in cases if c.status == "closed")
    analyzing = sum(1 for c in cases if c.status == "analyzing")
    avg_risk = sum(c.risk_score or 0 for c in cases) / total if total else 0
    by_type = {}
    for c in cases:
        by_type[c.case_type] = by_type.get(c.case_type, 0) + 1
    return jsonify({
        "total": total,
        "active": active,
        "closed": closed,
        "analyzing": analyzing,
        "avg_risk": round(avg_risk, 1),
        "by_type": by_type
    })

if __name__ == "__main__":
    is_groq_available()
    app.run(debug=True, port=5000)
