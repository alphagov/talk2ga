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
FF_LANGFUSE_ENABLED = os.getenv("FF_LANGFUSE_ENABLED", "false") == "true"
FF_PROMPT_REFINEMENT_ENABLED = os.getenv("FF_PROMPT_REFINEMENT_ENABLED", "false") == "true"
FF_PROMPT_EXAMPLE_ROWS = os.getenv("FF_PROMPT_EXAMPLE_ROWS", "true") == "true"
# NB_PARALLEL_SQL_GEN = int(os.getenv("NB_PARALLEL_SQL_GEN", 3))
NB_PARALLEL_SQL_GEN = 1
GCP_PROJECT = "data-insights-experimentation"
GA4_PROJECT = "ga4-analytics-352613"
DATASET = "flattened_dataset"
SQLALCHEMY_URL = f"bigquery://{GA4_PROJECT}/{DATASET}"
TABLE_NAME = "flattened_daily_ga_data_"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DATASET_DESCRIPTION_FORMAT = os.getenv("DATASET_DESCRIPTION_FORMAT", "SQL")
MAX_RESULTS = int(os.getenv("MAX_RESULTS", 20))
MAX_QUERY_COST_USD = int(os.getenv("MAX_QUERY_COST_USD", 1.055))


if __name__ == "__main__":
    print(f"Environment: {ENVIRONMENT}")
    print(f"Dataset URL: {DB_URL}")
    print()
