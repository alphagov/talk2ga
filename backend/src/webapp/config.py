import os
from dotenv import load_dotenv

load_dotenv()


def get_db_url(env: str):
    if env == "local":
        return os.getenv("DB_URL_LOCAL")
    elif env == "development":
        return os.getenv("DB_URL_DEV")
    else:
        raise Exception(f"No DB URL for environment: {env}")


environment = os.getenv("ENV", "local")
print("Environment:", environment)
db_url = get_db_url(environment)

assert db_url, "DB URL is not set in the environment"

print(f"Environment: {environment}")
print(f"Dataset URL: {db_url}")


langfuse_enabled = os.getenv("LANGFUSE_ENABLED", "false") == "true"

print(
    f"Langfuse enabled: {langfuse_enabled}",
    f"Environment: {environment}",
    f"Dataset URL: {db_url}",
    f"LANGFUSE_ENABLED: {os.getenv('LANGFUSE_ENABLED')}",
    f"LANGFUSE_SECRET_KEY: {os.getenv('LANGFUSE_SECRET_KEY')}",
    f"LANGFUSE_PUBLIC_KEY: {os.getenv('LANGFUSE_PUBLIC_KEY')}",
    f"LANGFUSE_HOST: {os.getenv('LANGFUSE_HOST')}",
)


if __name__ == "__main__":
    print(f"Environment: {environment}")
    print(f"Dataset URL: {db_url}")
    print()
