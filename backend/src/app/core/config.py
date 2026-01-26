from pydantic_settings import BaseSettings

class Settings(BaseSettings):
	app_name: str = "RH Copilot API"
	database_url: str = "sqlite:///./dev.db"  # depois troca pra Postgres no deploy

	class Config:
		env_file = ".env"

settings = Settings()
