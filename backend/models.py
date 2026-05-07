from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone
import json

db = SQLAlchemy()

def _utcnow():
    return datetime.now(timezone.utc)


class ChatMessage(db.Model):
    id         = db.Column(db.Integer, primary_key=True)
    case_id    = db.Column(db.Integer, db.ForeignKey('case.id'), nullable=False)
    user_id    = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    role       = db.Column(db.String(16), nullable=False)   # 'user' | 'assistant'
    content    = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=_utcnow)

    def to_dict(self):
        return {
            "id":         self.id,
            "case_id":    self.case_id,
            "role":       self.role,
            "content":    self.content,
            "created_at": self.created_at.isoformat(),
        }


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120))
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=_utcnow)
    cases = db.relationship('Case', backref='user', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "created_at": self.created_at.isoformat()
        }


class Case(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200))
    case_type = db.Column(db.String(100))       # criminal, civil, family, corporate, property
    description = db.Column(db.Text)
    parties = db.Column(db.String(300))         # "Petitioner vs. Respondent"
    court = db.Column(db.String(200))           # "Delhi High Court"
    status = db.Column(db.String(50), default="analyzing")   # analyzing, active, closed
    risk_score = db.Column(db.Float, default=0.0)
    risk_factors = db.Column(db.Text, default="[]")          # JSON list
    summary = db.Column(db.Text)
    precedents = db.Column(db.Text, default="[]")            # JSON list
    similar_judgements = db.Column(db.Text, default="[]")    # JSON list
    documents = db.Column(db.Text, default="[]")             # JSON list of filenames
    rag_ready = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=_utcnow)
    updated_at = db.Column(db.DateTime, default=_utcnow, onupdate=_utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "case_type": self.case_type,
            "description": self.description,
            "parties": self.parties or "",
            "court": self.court or "",
            "status": self.status,
            "risk_score": self.risk_score,
            "risk_factors": json.loads(self.risk_factors or "[]"),
            "summary": self.summary,
            "precedents": json.loads(self.precedents or "[]"),
            "similar_judgements": json.loads(self.similar_judgements or "[]"),
            "documents": json.loads(self.documents or "[]"),
            "rag_ready": self.rag_ready,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }