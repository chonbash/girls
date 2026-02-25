from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./girls.db"
    admin_password_hash: str = ""  # set via env ADMIN_PASSWORD_HASH (bcrypt)
    secret_key: str = "change-me-in-production"
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = "noreply@zhdanov.uno"
    base_url: str = "https://zhdanov.uno/girls"
    code_expire_hours: int = 24

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
