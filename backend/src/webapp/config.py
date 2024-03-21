import os

environment: str = os.getenv("ENVIRONMENT", "local")

db_urls = {
    "local": "postgresql+asyncpg://local:local@localhost:5433/local",
    "local-docker": "postgresql+asyncpg://local:local@db:5432/local",
    "development": os.getenv("DB_URL", "!Missing!"),
    "production": os.getenv("DB_URL", "!Missing!"),
}


def get_db_url() -> str:
    return db_urls[environment]


if __name__ == "__main__":
    print(f"Environment: {environment}")
    print(f"Dataset URL: {get_db_url()}")
    print()
