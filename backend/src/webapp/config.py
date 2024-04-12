import os
from dotenv import load_dotenv

load_dotenv()

def get_db_url(env: str):
    if env == 'local':
        return os.getenv('DB_URL_LOCAL')
    elif env == 'development':
        return os.getenv('DB_URL_DEV')
    else:
        raise Exception(f'No DB URL for environment: {env}')

environment = os.getenv("ENV", "local")
db_url = get_db_url(environment)

assert db_url, "DB_URL environment variable is not set"

print(f"Environment: {environment}")
print(f"Dataset URL: {db_url}")


if __name__ == "__main__":
    print(f"Environment: {environment}")
    print(f"Dataset URL: {db_url}")
    print()