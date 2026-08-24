from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Delivery API"
    API_V1_PREFIX: str = "/api/v1"
    SECRET_KEY: str = "change-me"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/delivery_db"
    BACKEND_CORS_ORIGINS: str = "http://localhost:3000,http://localhost"
    SEED_DEMO_DATA: bool = False

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
