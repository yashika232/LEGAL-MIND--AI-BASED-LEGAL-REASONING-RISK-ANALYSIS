import os
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from utils.pdf_parser import extract_text

# Shared base dir — always resolved relative to this file so it works
# regardless of where Flask is launched from.
RAG_BASE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "rag_data")

_emb = None

def get_embeddings():
    global _emb
    if _emb is None:
        _emb = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    return _emb


def chunk(text, size=400):
    words = text.split()
    return [" ".join(words[i:i + size]) for i in range(0, len(words), size)]


def ingest_case(case_id, file_paths, rag_base_dir=None):
    """
    Ingest documents for a specific case into a LangChain-compatible FAISS index.
    Returns (all_text: str, rag_ok: bool).
    """
    base = rag_base_dir or RAG_BASE_DIR
    os.makedirs(base, exist_ok=True)
    case_dir = os.path.join(base, str(case_id))
    os.makedirs(case_dir, exist_ok=True)

    chunks = []
    all_text = ""

    for path in file_paths:
        ext = os.path.splitext(path)[1].lower()
        try:
            if ext == ".pdf":
                text = extract_text(path)
            elif ext == ".docx":
                text = _extract_docx(path)
            else:
                with open(path, "r", errors="ignore") as f:
                    text = f.read()
        except Exception as e:
            print(f"[Ingest] Could not read {path}: {e}")
            text = ""

        all_text += text + "\n\n"
        chunks += chunk(text)

    if not chunks:
        return all_text, False

    try:
        emb = get_embeddings()
        vectorstore = FAISS.from_texts(chunks, emb)
        vectorstore.save_local(case_dir)          # saves index.faiss + index.pkl
        return all_text, True
    except Exception as e:
        print(f"[Ingest] FAISS build error: {e}")
        return all_text, False


def _extract_docx(path):
    """Extract plain text from a .docx file using python-docx."""
    try:
        from docx import Document
        doc = Document(path)
        return "\n".join(p.text for p in doc.paragraphs if p.text.strip())
    except ImportError:
        print("[Ingest] python-docx not installed. Run: pip install python-docx")
        return ""
    except Exception as e:
        print(f"[Ingest] DOCX parse error for {path}: {e}")
        return ""