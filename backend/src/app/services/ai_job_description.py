def generate_full_job_description(title: str, short_description: str) -> str:
    # MVP: mock. Depois liga em LLM open-source.
    return (
        f"Vaga: {title}\n\n"
        f"Resumo: {short_description}\n\n"
        "Responsabilidades:\n"
        "- Construir e manter APIs\n"
        "- Trabalhar com banco de dados\n\n"
        "Requisitos:\n"
        "- Experiência na área\n"
        "- Boas práticas de desenvolvimento\n"
    )
