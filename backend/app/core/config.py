from pathlib import Path
from typing import Optional

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./backend/lodge_optical.db"
    JWT_SECRET: str = "dev-insecure-jwt-secret"
    ENVIRONMENT: str = "development"

    # Square Payment Settings
    SQUARE_ACCESS_TOKEN: str = ""
    SQUARE_ENVIRONMENT: str = "sandbox"
    SQUARE_WEBHOOK_SIGNATURE_KEY: str = ""

    # Optional AI settings
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o-mini"

    model_config = SettingsConfigDict(
        env_file=(str(Path(__file__).resolve().parents[2] / ".env"), ".env"),
        case_sensitive=True,
        extra="ignore",
    )

    @model_validator(mode="after")
    def validate_production_configuration(self) -> "Settings":
        if self.ENVIRONMENT.lower() != "production":
            return self

        missing = []
        if self.JWT_SECRET == "dev-insecure-jwt-secret":
            missing.append("JWT_SECRET")
        if not self.DATABASE_URL:
            missing.append("DATABASE_URL")
        if not self.SQUARE_ACCESS_TOKEN:
            missing.append("SQUARE_ACCESS_TOKEN")
        if not self.SQUARE_WEBHOOK_SIGNATURE_KEY:
            missing.append("SQUARE_WEBHOOK_SIGNATURE_KEY")

        if missing:
            raise ValueError(
                "Production configuration is incomplete. Missing or insecure settings: "
                + ", ".join(missing)
            )

        return self


settings = Settings()
