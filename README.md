# rh-copilot

Estrutura do repositório para o projeto RH Copilot.

## Banco de dados

Por padrao, o backend usa SQLite (arquivo `dev.db`).
Para preparar para Postgres, defina `DATABASE_URL` no arquivo `.env`.

Exemplo `.env` para Postgres:

```env
DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/rh_copilot
```

## Postgres local (Docker)

Suba o banco com Docker Compose:

```bash
docker compose up -d
```

Depois crie o arquivo `backend/.env`:

```env
DATABASE_URL=postgresql+psycopg://rh:rh@localhost:5432/rh_copilot
DATABASE_ECHO=false
DATABASE_POOL_PRE_PING=true
```

## Migrations (Alembic)

Use o Alembic dentro da pasta `backend`:

```bash
cd backend
alembic revision --autogenerate -m "init"
alembic upgrade head
```
