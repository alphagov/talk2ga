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


ENVIRONMENT = os.getenv("ENV", "local")
DB_URL = get_db_url(ENVIRONMENT)

assert DB_URL, "Database URL is not set in the environment"


# *******************************
# *                             *
# *         LLM CONFIG          *
# *                             *
# *******************************
LANGFUSE_ENABLED = os.getenv("LANGFUSE_ENABLED", "false") == "true"
NB_PARALLEL_SQL_GEN = int(os.getenv("NB_PARALLEL_SQL_GEN", 3))
GCP_PROJECT = "data-insights-experimentation"
GA4_PROJECT = "ga4-analytics-352613"
DATASET = "flattened_dataset"
SQLALCHEMY_URL = f"bigquery://{GA4_PROJECT}/{DATASET}"
TABLE_NAME = "flattened_daily_ga_data_"


if __name__ == "__main__":
    print(f"Environment: {ENVIRONMENT}")
    print(f"Dataset URL: {DB_URL}")
    print()