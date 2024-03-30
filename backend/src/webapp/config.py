import os
from dotenv import load_dotenv

load_dotenv()

environment = os.getenv("ENV", "local")
db_url = os.getenv("DB_URL")

assert db_url, "DB_URL environment variable is not set"

print(f"Environment: {environment}")
print(f"Dataset URL: {db_url}")


if __name__ == "__main__":
    print(f"Environment: {environment}")
    print(f"Dataset URL: {db_url}")
    print()
