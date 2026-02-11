from pydantic_settings import BaseSettings


class Settings(BaseSettings):
	app_name: str = "RH Copilot API"
	# Use DATABASE_URL no .env para Postgres, ex:
	# postgresql+psycopg://user:pass@host:5432/rh_copilot
	database_url: str = "sqlite:///./dev.db"
	database_echo: bool = False
	database_pool_pre_ping: bool = True

	class Config:
		env_file = ".env"


settings = Settings()
