def answer_from_documents(question: str, documents: list[tuple[str, str]]) -> str:
    # documents: [(title, content), ...]
    # MVP: pega o doc mais “provável” só por conter palavras
    q = question.lower()
    for title, content in documents:
        if any(w in content.lower() for w in q.split()):
            return f"Com base no documento '{title}': {content[:240]}..."
    return "Não encontrei essa informação nos documentos enviados. Tente reformular a pergunta."
