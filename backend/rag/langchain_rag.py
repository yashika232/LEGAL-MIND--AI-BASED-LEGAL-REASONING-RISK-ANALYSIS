import os
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from config import GEMINI_API_KEY

RAG_BASE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "rag_data")

_emb = None
_chain_cache = {}
_CHAIN_CACHE_MAX = 20  # evict oldest entries beyond this limit


def _cache_set(case_id, chain):
    """Store chain with simple LRU eviction to prevent unbounded memory growth."""
    if case_id not in _chain_cache and len(_chain_cache) >= _CHAIN_CACHE_MAX:
        # Evict the oldest entry (insertion-order guaranteed in Python 3.7+)
        _chain_cache.pop(next(iter(_chain_cache)))
    _chain_cache[case_id] = chain

PROMPT = PromptTemplate.from_template("""You are a senior Indian legal advisor with deep expertise in Indian law, the Constitution, IPC, CrPC, CPC, and relevant Acts.

Your role is to answer legal questions strictly based on the provided case documents. Respond in a highly structured, professional, and organized manner as a lawyer would in a legal brief or memo.

DOCUMENT EXCERPTS:
{context}

{history}CURRENT QUESTION: {question}

INSTRUCTIONS FOR YOUR RESPONSE:
- If the answer is found in the documents, cite the relevant section/page context.
- If there is conversation history above, take it into account for follow-up questions and continuity.
- Organize your answer with clear headings when appropriate (e.g., **Legal Position**, **Relevant Provisions**, **Key Facts from Documents**, **Risk Assessment**, **Recommended Action**).
- Reference exact clauses, section numbers, or document excerpts when possible.
- Use bullet points for lists of items (risks, provisions, arguments).
- If the documents do not contain enough information to fully answer, clearly state what is found and what requires further investigation.
- Never fabricate facts, case names, or statutory provisions not present in the documents or your legal knowledge.
- End with a **Summary** in 2-3 sentences.

Answer:""")


def get_embeddings():
    global _emb
    if _emb is None:
        _emb = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    return _emb


def get_chain(case_id, rag_base_dir=None):
    if case_id in _chain_cache:
        return _chain_cache[case_id]

    base = rag_base_dir or RAG_BASE_DIR
    case_dir = os.path.join(base, str(case_id))
    index_path = os.path.join(case_dir, "index.faiss")

    if not os.path.exists(index_path):
        print(f"[RAG] No index found at {index_path}. Run analysis first.")
        return None

    try:
        emb = get_embeddings()
        vectorstore = FAISS.load_local(case_dir, emb, allow_dangerous_deserialization=True)
        # Retrieve more chunks for richer context
        retriever = vectorstore.as_retriever(search_kwargs={"k": 6})

        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=GEMINI_API_KEY,
            temperature=0.15,
        )

        def format_docs(docs):
            formatted = []
            for i, d in enumerate(docs, 1):
                formatted.append(f"[Excerpt {i}]\n{d.page_content}")
            return "\n\n---\n\n".join(formatted)

        chain = (
            {
                "context":  (lambda x: x["question"]) | retriever | format_docs,
                "question": lambda x: x["question"],
                "history":  lambda x: x.get("history", ""),
            }
            | PROMPT
            | llm
            | StrOutputParser()
        )

        _cache_set(case_id, chain)
        return chain

    except Exception as e:
        print(f"[RAG] Failed to build chain for case {case_id}: {e}")
        return None


def ask(case_id, query, history=""):
    chain = get_chain(case_id)
    if not chain:
        return "RAG index not found for this case. Please ensure documents are ingested first."
    try:
        history_section = ""
        if history.strip():
            history_section = f"CONVERSATION HISTORY (for context):\n{history}\n"
        return chain.invoke({"question": query, "history": history_section})
    except Exception as e:
        print(f"[RAG] Query error for case {case_id}: {e}")
        return f"Error processing your query: {str(e)}"
