from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings

db_url = settings.database_url
connect_args = {}
if db_url.startswith("sqlite"):
	connect_args = {"check_same_thread": False}

engine = create_engine(
	db_url,
	future=True,
	echo=settings.database_echo,
	pool_pre_ping=settings.database_pool_pre_ping,
	connect_args=connect_args,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
	pass


def get_db():
	db = SessionLocal()
	try:
		yield db
	finally:
		db.close()
