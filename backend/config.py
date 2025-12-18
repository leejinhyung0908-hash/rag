"""애플리케이션 설정 관리."""
import os
from typing import Optional

from dotenv import load_dotenv

# 프로젝트 루트의 .env 파일을 로드한다.
load_dotenv()


class Settings:
    """애플리케이션 설정."""

    # 데이터베이스 설정 (동기 psycopg용)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "postgresql+psycopg://postgres:postgres@pgvector:5432/rag"
    )

    # LangChain PGEngine / asyncpg용 연결 문자열
    # 예: postgresql+asyncpg://USER:PASSWORD@HOST:5432/DBNAME
    PGENGINE_URL: str = os.getenv(
        "PGENGINE_URL",
        "postgresql+asyncpg://postgres:postgres@pgvector:5432/rag",
    )

    # OpenAI 설정
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    # 벡터 임베딩 설정
    EMBED_DIM: int = int(os.getenv("EMBED_DIM", "8"))

    # API 설정
    API_TITLE: str = "LangChain RAG API"
    API_VERSION: str = "0.1.0"
    API_DESCRIPTION: str = "LangChain과 pgvector를 사용한 RAG 시스템 API"

    # CORS 설정
    CORS_ORIGINS: list[str] = os.getenv("CORS_ORIGINS", "*").split(",")

    # 서버 설정
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # LLM 모델 설정
    MODEL_BASE_PATH: str = os.getenv("MODEL_BASE_PATH", "./model")
    DEFAULT_MODEL_TYPE: str = os.getenv("DEFAULT_MODEL_TYPE", "midm")
    DEFAULT_MODEL_NAME: str = os.getenv("DEFAULT_MODEL_NAME", "midm")


settings = Settings()

