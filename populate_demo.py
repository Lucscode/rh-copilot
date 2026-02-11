"""
Script para popular dados de demo no banco de dados
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent / "backend" / "src"))

from app.db.session import SessionLocal, engine
from app.db.models import Base, User, Job, Candidate, Application, Document, UserRole, ApplicationStatus
from app.core.auth import hash_password
from app.services.ai_job_description import generate_full_job_description
from app.services.ai_resume_match import compute_match_score, summarize_candidate

# Criar tabelas
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Limpar dados existentes
db.query(Application).delete()
db.query(Candidate).delete()
db.query(Job).delete()
db.query(User).delete()
db.commit()

# Criar usuários
users_data = [
    {"name": "RH Demo", "email": "rh@demo.com", "password": "password", "role": UserRole.RH},
    {"name": "João Silva", "email": "joao@demo.com", "password": "password", "role": UserRole.CANDIDATO},
    {"name": "Maria Santos", "email": "maria@demo.com", "password": "password", "role": UserRole.CANDIDATO},
    {"name": "Pedro Funcionário", "email": "pedro@demo.com", "password": "password", "role": UserRole.FUNCIONARIO},
    {"name": "Admin Sistema", "email": "admin@demo.com", "password": "password", "role": UserRole.ADMIN},
]

users = {}
for user_data in users_data:
    user = User(
        name=user_data["name"],
        email=user_data["email"],
        password_hash=hash_password(user_data["password"]),
        role=user_data["role"]
    )
    db.add(user)
    users[user_data["email"]] = user

db.commit()

# Criar vagas
rh_user = users["rh@demo.com"]
jobs_data = [
    {
        "title": "Dev Backend Python",
        "short_description": "Vaga para Backend Python com FastAPI e PostgreSQL"
    },
    {
        "title": "Dev Frontend React",
        "short_description": "Vaga para Frontend com React, TypeScript e Tailwind CSS"
    },
    {
        "title": "Dev Full Stack",
        "short_description": "Desenvolvimento Full Stack com Python e React"
    }
]

jobs = []
for job_data in jobs_data:
    full_desc = generate_full_job_description(job_data["title"], job_data["short_description"])
    job = Job(
        title=job_data["title"],
        short_description=job_data["short_description"],
        full_description=full_desc,
        created_by=rh_user.id
    )
    db.add(job)
    jobs.append(job)

db.commit()

# Criar candidatos
candidates_data = [
    {
        "name": "João Pereira",
        "email": "joao.pereira@demo.com",
        "resume_text": "Python, FastAPI, PostgreSQL, Docker, APIs REST, testes com pytest. Experiência 5 anos."
    },
    {
        "name": "Ana Oliveira",
        "email": "ana.oliveira@demo.com",
        "resume_text": "Python, Django, MySQL, Flask, Linux. Experiência 3 anos em desenvolvimento backend."
    },
    {
        "name": "Carlos Costa",
        "email": "carlos.costa@demo.com",
        "resume_text": "React, TypeScript, HTML5, CSS3, JavaScript, Node.js. Experiência 4 anos frontend."
    },
    {
        "name": "Beatriz Alves",
        "email": "beatriz.alves@demo.com",
        "resume_text": "Full Stack: Python, React, PostgreSQL, Docker, Kubernetes. Experiência 6 anos."
    }
]

candidates = []
for cand_data in candidates_data:
    cand = Candidate(
        name=cand_data["name"],
        email=cand_data["email"],
        resume_text=cand_data["resume_text"]
    )
    db.add(cand)
    candidates.append(cand)

db.commit()

# Criar aplicações com match scores
for job in jobs:
    base_text = f"{job.title}\n{job.short_description}\n{job.full_description or ''}"
    for cand in candidates[:2]:  # 2 candidatos por vaga
        score = compute_match_score(base_text, cand.resume_text)
        summ = summarize_candidate(cand.resume_text)
        app = Application(
            job_id=job.id,
            candidate_id=cand.id,
            match_score=score,
            summary=summ,
            status=ApplicationStatus.APLICADO
        )
        db.add(app)

db.commit()

# Criar documentos
docs_data = [
    {
        "title": "Política de Férias",
        "content": "O colaborador tem direito a 30 dias de férias por ano, após 12 meses trabalhados. As férias devem ser solicitadas com antecedência mínima de 30 dias."
    },
    {
        "title": "Código de Conduta",
        "content": "Todos os colaboradores devem manter comportamento profissional e ético. Respeito, integridade e transparência são valores fundamentais."
    },
    {
        "title": "Política de Home Office",
        "content": "Home office é permitido 2 dias por semana. Os colaboradores devem estar disponíveis durante horário comercial."
    }
]

for doc_data in docs_data:
    doc = Document(
        title=doc_data["title"],
        content=doc_data["content"]
    )
    db.add(doc)

db.commit()

print("✓ Demo data populada com sucesso!")
print(f"  - {len(users)} usuários criados")
print(f"  - {len(jobs)} vagas criadas")
print(f"  - {len(candidates)} candidatos criados")
print(f"  - {len(candidates_data) * len(jobs_data)} aplicações criadas")
print(f"  - {len(docs_data)} documentos criados")

db.close()
