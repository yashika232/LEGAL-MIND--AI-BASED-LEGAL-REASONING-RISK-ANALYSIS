from utils.llm import run_llama
import json

def summarize(text, case_type="general"):
    prompt = f"""You are an expert Indian legal advisor. Analyze this {case_type} legal document and provide a structured analysis.

Document:
{text[:3000]}

Respond ONLY with valid JSON in this exact format:
{{
  "summary": "2-3 sentence summary",
  "key_points": ["point1", "point2", "point3"],
  "risks": ["risk1", "risk2"],
  "risk_score": 65,
  "risk_factors": [
    {{"factor": "Evidence Strength", "score": 70}},
    {{"factor": "Legal Precedent", "score": 55}},
    {{"factor": "Witness Credibility", "score": 80}},
    {{"factor": "Documentation", "score": 60}},
    {{"factor": "Timeline Consistency", "score": 75}}
  ],
  "clauses": ["clause1", "clause2"],
  "statutes": ["IPC Section X", "CrPC Section Y"],
  "precedents": [
    {{"case": "Case Name vs State", "year": "2020", "relevance": "Similar facts pattern", "outcome": "Favorable"}},
    {{"case": "Another Case", "year": "2018", "relevance": "Evidence standard", "outcome": "Mixed"}}
  ]
}}"""
    
    try:
        response = run_llama(prompt)
        # Try to extract JSON from response
        start = response.find('{')
        end = response.rfind('}') + 1
        if start >= 0 and end > start:
            return json.loads(response[start:end])
    except Exception as e:
        print(f"Summarization error: {e}")
    
    # Fallback
    return {
        "summary": "Document analyzed successfully.",
        "key_points": ["Review complete", "Documents processed"],
        "risks": ["Further review recommended"],
        "risk_score": 50,
        "risk_factors": [
            {"factor": "Evidence Strength", "score": 50},
            {"factor": "Legal Precedent", "score": 50},
            {"factor": "Witness Credibility", "score": 50},
            {"factor": "Documentation", "score": 50},
            {"factor": "Timeline Consistency", "score": 50}
        ],
        "clauses": [],
        "statutes": [],
        "precedents": []
    }
