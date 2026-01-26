import re

def _tokenize(text: str) -> set[str]:
    words = re.findall(r"[a-zA-ZÀ-ÿ0-9\+\.\#]+", text.lower())
    return set(words)

def compute_match_score(job_text: str, resume_text: str) -> float:
    # MVP simples: similaridade por interseção de tokens (rápido e gratuito)
    jt = _tokenize(job_text)
    rt = _tokenize(resume_text)
    if not jt or not rt:
        return 0.0
    score = len(jt & rt) / len(jt | rt)
    return float(round(score, 4))

def summarize_candidate(resume_text: str) -> str:
    # MVP: “resumo” simples. Depois liga em LLM.
    snippet = resume_text.strip().replace("\n", " ")
    return (snippet[:220] + "...") if len(snippet) > 220 else snippet
