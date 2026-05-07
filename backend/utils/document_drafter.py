"""
Document Drafter — generates standard Indian legal document drafts.

This module produces DRAFT templates only. All generated documents:
- Are marked clearly as "DRAFT — FOR REVIEW BY QUALIFIED ADVOCATE ONLY"
- Do not constitute legal advice
- Must be reviewed, verified, and signed by a licensed advocate before use
- Follow standard Indian court formats used across district/high courts
"""

import google.generativeai as genai
from config import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)
_model = None

def get_model():
    global _model
    if _model is None:
        _model = genai.GenerativeModel("gemini-2.5-flash")
    return _model


# ── Document type definitions ────────────────────────────────────────────────

DOCUMENT_TYPES = {
    # Civil / General
    "vakalatnama": {
        "label": "Vakalatnama",
        "category": "General",
        "description": "Power of authority given by a client to an advocate to appear and plead on their behalf.",
        "fields": ["client_name", "client_address", "advocate_name", "advocate_enrollment", "court_name", "case_title", "case_number"]
    },
    "legal_notice": {
        "label": "Legal Notice",
        "category": "General",
        "description": "Formal legal notice sent before initiating legal proceedings.",
        "fields": ["sender_name", "sender_address", "recipient_name", "recipient_address", "subject_matter", "relief_sought", "notice_period_days"]
    },
    "affidavit": {
        "label": "Affidavit",
        "category": "General",
        "description": "A sworn written statement used as evidence in court proceedings.",
        "fields": ["deponent_name", "deponent_age", "deponent_address", "deponent_occupation", "subject_matter", "facts", "court_name"]
    },

    # Civil Suits
    "civil_plaint": {
        "label": "Civil Plaint (CPC Order VII)",
        "category": "Civil",
        "description": "Plaint filed in civil court under CPC Order VII Rule 1.",
        "fields": ["court_name", "plaintiff_name", "plaintiff_address", "defendant_name", "defendant_address", "cause_of_action", "relief_sought", "valuation", "limitation_period"]
    },
    "written_statement": {
        "label": "Written Statement (CPC Order VIII)",
        "category": "Civil",
        "description": "Defendant's reply to the plaint under CPC Order VIII.",
        "fields": ["court_name", "case_number", "plaintiff_name", "defendant_name", "admissions_denials", "special_defences", "set_off_counterclaim"]
    },
    "interim_injunction": {
        "label": "Application for Interim Injunction (Order XXXIX)",
        "category": "Civil",
        "description": "Application seeking temporary injunction under CPC Order XXXIX Rules 1 & 2.",
        "fields": ["court_name", "case_number", "applicant_name", "respondent_name", "nature_of_dispute", "irreparable_harm", "balance_of_convenience", "relief_sought"]
    },

    # Criminal
    "bail_application": {
        "label": "Bail Application (Section 439 CrPC / BNSS)",
        "category": "Criminal",
        "description": "Application for regular bail under Section 439 CrPC or BNSS equivalent.",
        "fields": ["court_name", "case_number", "fir_number", "police_station", "accused_name", "accused_age", "accused_address", "offence_sections", "grounds_for_bail", "surety_details"]
    },
    "anticipatory_bail": {
        "label": "Anticipatory Bail Application (Section 438 CrPC / BNSS)",
        "category": "Criminal",
        "description": "Application for anticipatory bail under Section 438 CrPC.",
        "fields": ["court_name", "applicant_name", "applicant_address", "anticipated_offence", "fir_details_if_any", "grounds", "conditions_offered"]
    },
    "criminal_complaint": {
        "label": "Criminal Complaint (Section 200 CrPC / BNSS)",
        "category": "Criminal",
        "description": "Complaint filed before a Magistrate under Section 200 CrPC.",
        "fields": ["court_name", "complainant_name", "complainant_address", "accused_name", "accused_address", "offence_sections", "facts_of_case", "relief_sought"]
    },
    "quashing_petition": {
        "label": "Petition to Quash FIR (Section 482 CrPC / 528 BNSS)",
        "category": "Criminal",
        "description": "Petition to quash FIR or criminal proceedings under High Court inherent powers.",
        "fields": ["high_court_name", "petitioner_name", "respondent_state", "fir_number", "police_station", "offence_sections", "grounds_for_quashing"]
    },

    # Family Law
    "divorce_petition": {
        "label": "Divorce Petition (Hindu Marriage Act / Special Marriage Act)",
        "category": "Family",
        "description": "Petition for dissolution of marriage under HMA Section 13 or SMA Section 27.",
        "fields": ["court_name", "petitioner_name", "petitioner_address", "respondent_name", "respondent_address", "marriage_date", "marriage_place", "act_applicable", "ground_for_divorce", "children_details", "maintenance_sought"]
    },
    "maintenance_application": {
        "label": "Maintenance Application (Section 125 CrPC / BNSS)",
        "category": "Family",
        "description": "Application for maintenance under Section 125 CrPC.",
        "fields": ["court_name", "applicant_name", "applicant_address", "respondent_name", "respondent_address", "relationship", "income_of_respondent", "monthly_maintenance_sought", "grounds"]
    },
    "custody_petition": {
        "label": "Child Custody Petition (Guardians & Wards Act / HMA)",
        "category": "Family",
        "description": "Petition seeking custody or guardianship of a minor child.",
        "fields": ["court_name", "petitioner_name", "respondent_name", "child_name", "child_age", "current_custody_arrangement", "grounds_for_custody", "welfare_of_child"]
    },

    # Property / Revenue
    "property_injunction": {
        "label": "Suit for Permanent Injunction (Property)",
        "category": "Property",
        "description": "Suit to restrain trespass or encroachment on immovable property.",
        "fields": ["court_name", "plaintiff_name", "plaintiff_address", "defendant_name", "defendant_address", "property_description", "title_basis", "encroachment_facts", "relief_sought"]
    },
    "partition_suit": {
        "label": "Suit for Partition",
        "category": "Property",
        "description": "Suit for partition of jointly-held immovable property.",
        "fields": ["court_name", "plaintiff_name", "defendant_names", "property_description", "share_claimed", "relationship_of_parties", "basis_of_title"]
    },

    # Writ Petitions
    "writ_habeas_corpus": {
        "label": "Writ of Habeas Corpus (Article 226/32)",
        "category": "Constitutional / Writ",
        "description": "Writ petition for release of a person from unlawful detention.",
        "fields": ["court_name", "petitioner_name", "detenu_name", "detaining_authority", "date_of_detention", "grounds_of_detention", "grounds_for_writ"]
    },
    "writ_mandamus": {
        "label": "Writ of Mandamus (Article 226/32)",
        "category": "Constitutional / Writ",
        "description": "Writ to compel a public authority to perform its legal duty.",
        "fields": ["court_name", "petitioner_name", "respondent_authority", "legal_duty_in_question", "representations_made", "refusal_or_inaction", "relief_sought"]
    },

    # Consumer
    "consumer_complaint": {
        "label": "Consumer Complaint (Consumer Protection Act 2019)",
        "category": "Consumer",
        "description": "Complaint before District / State / National Consumer Commission.",
        "fields": ["forum_name", "complainant_name", "complainant_address", "opposite_party_name", "opposite_party_address", "goods_or_service", "deficiency_facts", "amount_in_dispute", "relief_claimed", "limitation_period"]
    },

    # Labour / Employment
    "labour_complaint": {
        "label": "Complaint under Industrial Disputes Act / Labour Laws",
        "category": "Labour",
        "description": "Complaint before Labour Court or Industrial Tribunal.",
        "fields": ["forum_name", "complainant_name", "employer_name", "nature_of_dispute", "date_of_retrenchment_or_dispute", "attempts_at_conciliation", "relief_sought"]
    },
}


DRAFT_SYSTEM_PROMPT = """You are an expert Indian legal draftsman with 20+ years of experience drafting documents for Indian courts including District Courts, High Courts, and Supreme Court.

You will draft a legal document based on the provided details. Follow these strict guidelines:

1. Use proper Indian legal document format with correct headings and structure.
2. Use formal legal language appropriate for Indian courts.
3. Include all standard clauses required for this document type under Indian law.
4. Reference correct Acts, Sections, and Rules applicable under current Indian law.
5. Use [BLANK] for any information not provided that the lawyer must fill in.
6. Start the document with:
   ===DRAFT DOCUMENT — FOR REVIEW BY QUALIFIED ADVOCATE ONLY===
   This document is a computer-generated draft template. It must be reviewed,
   verified for accuracy, and properly executed by a licensed advocate before use.
7. Include a LAWYER'S CHECKLIST at the end listing items to verify before filing.
8. Do NOT include any fabricated case numbers, judge names, or false facts.
9. Use standard Indian court formatting: cause title, jurisdiction paragraph, prayer clause, verification.
"""


def draft_document(doc_type: str, case_details: dict, case_context: str = "") -> str:
    """
    Generate a legal document draft.
    
    Args:
        doc_type: Key from DOCUMENT_TYPES
        case_details: Dict of field values
        case_context: Optional RAG-retrieved case document context
    
    Returns:
        Draft document as a string
    """
    if doc_type not in DOCUMENT_TYPES:
        return f"Unknown document type: {doc_type}"

    doc_meta = DOCUMENT_TYPES[doc_type]

    # Build the details string
    details_str = "\n".join([f"- {k.replace('_', ' ').title()}: {v}" for k, v in case_details.items() if v])

    context_section = ""
    if case_context:
        context_section = f"""
RELEVANT CASE DOCUMENT CONTEXT (from uploaded case documents):
{case_context[:2000]}

Use the above context to fill in accurate details from the case where applicable.
"""

    prompt = f"""{DRAFT_SYSTEM_PROMPT}

DOCUMENT TYPE: {doc_meta['label']}
DESCRIPTION: {doc_meta['description']}

PROVIDED DETAILS:
{details_str}
{context_section}

Please draft the complete {doc_meta['label']} document now, following all applicable Indian law requirements and court formatting standards.
"""

    try:
        model = get_model()
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"[Drafter] Error: {e}")
        return f"Error generating document: {str(e)}"


def get_document_types_list():
    """Returns grouped document types for the frontend."""
    categories = {}
    for key, val in DOCUMENT_TYPES.items():
        cat = val["category"]
        if cat not in categories:
            categories[cat] = []
        categories[cat].append({
            "key": key,
            "label": val["label"],
            "description": val["description"],
            "fields": val["fields"]
        })
    return categories


CASE_TYPE_MAPPING = {
    "Criminal": ["bail_application","anticipatory_bail","criminal_complaint","quashing_petition"],
    "Civil": ["civil_plaint","written_statement","interim_injunction"],
    "Family": ["divorce_petition","maintenance_application","custody_petition"],
    "Property": ["property_injunction","partition_suit"],
}

def get_filtered_document_types(case_type):
    allowed = CASE_TYPE_MAPPING.get(case_type, DOCUMENT_TYPES.keys())
    return {k:v for k,v in DOCUMENT_TYPES.items() if k in allowed}
