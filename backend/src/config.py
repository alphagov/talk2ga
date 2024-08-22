import os
from google.cloud import secretmanager_v1 as secretmanager
import google.auth


class SecretManager:
    @staticmethod
    def get_secret(secret_id):
        try:
            _, project = google.auth.default()
            client = secretmanager.SecretManagerServiceClient()
            name = f"projects/{project}/secrets/{secret_id}/versions/latest"
            response = client.access_secret_version(name=name)
            return response.payload.data.decode("UTF-8")
        except Exception as e:
            print(f"Error retrieving secret {secret_id}: {e}")
            return None


class BaseConfig:
    ENV = os.getenv("ENV")
    RUN_CONTEXT = os.getenv("RUN_CONTEXT")

    assert ENV, "ENV environment variable must be set"
    assert RUN_CONTEXT and RUN_CONTEXT in ["local", "cloud"], "RUN_CONTEXT environment variable must be set to 'cloud' or 'local'"

    IS_CLOUD = RUN_CONTEXT == "cloud"
    GCP_PROJECT = os.getenv("GCP_PROJECT") or "data-insights-experimentation"


class DatabaseConfig(BaseConfig):
    @staticmethod
    def get_database_url():
        CLOUD_DB_URL_MAP = {"development": "db-url-dev", "old-production": "db-url-old-prod", "production": "db-url-prod"}
        LOCAL_DB_URL_MAP = {"local": "LOCAL_DB_URL", "development": "DEV_DB_URL", "old-production": "OLD_PROD_DB_URL", "production": "PROD_DB_URL"}
        if BaseConfig.IS_CLOUD:
            secret_id = CLOUD_DB_URL_MAP.get(BaseConfig.ENV)
            if not secret_id:
                raise ValueError(f"Unknown environment for cloud DB URL: {BaseConfig.ENV}")
            return SecretManager.get_secret(secret_id)
        else:
            env_var = LOCAL_DB_URL_MAP.get(BaseConfig.ENV)
            if not env_var:
                raise ValueError(f"Unknown environment for local DB URL env var: {BaseConfig.ENV}")
            db_url = os.getenv(env_var)
            if not db_url:
                raise ValueError(f"Database URL not set for environment variable: {env_var}")
            return db_url

    URL = get_database_url()


class LangfuseConfig(BaseConfig):
    @staticmethod
    def get_langfuse_key(key_type):
        LANGFUSE_KEY_MAP = {"development": {"public": "langfuse-dev-public-key", "secret": "langfuse-dev-secret-key", "host": "langfuse-dev-host"}, "production": {"public": "langfuse-prod-public-key", "secret": "langfuse-prod-secret-key", "host": "langfuse-prod-host"}}
        key_map = LANGFUSE_KEY_MAP.get(BaseConfig.ENV)
        if not key_map:
            raise ValueError(f"Unknown environment: {BaseConfig.ENV}")
        secret_id = key_map.get(key_type)
        if not secret_id:
            raise ValueError(f"Unknown key type: {key_type}")
        return SecretManager.get_secret(secret_id)

    ENABLED = os.getenv("FF_LANGFUSE_ENABLED", "false") == "true"

    print("Langfuse is enabled." if ENABLED else "Langfuse is disabled.")

    PUBLIC_KEY = (os.getenv("LANGFUSE_PUBLIC_KEY") or get_langfuse_key("public")) if ENABLED else None
    SECRET_KEY = (os.getenv("LANGFUSE_SECRET_KEY") or get_langfuse_key("secret")) if ENABLED else None
    HOST = (os.getenv("LANGFUSE_HOST") or get_langfuse_key("host")) if ENABLED else None

    if ENABLED:
        if not PUBLIC_KEY or not SECRET_KEY:
            ENABLED = False
            print("Langfuse is disabled because the public or private key could not be retrieved.")
        else:
            os.environ["LANGFUSE_HOST"] = HOST or ""
            os.environ["LANGFUSE_PUBLIC_KEY"] = PUBLIC_KEY or ""
            os.environ["LANGFUSE_SECRET_KEY"] = SECRET_KEY or ""


class BigQueryConfig(BaseConfig):
    PROJECT = "ga4-analytics-352613"
    DATASET = "flattened_dataset"
    SQLALCHEMY_URL = f"bigquery://{PROJECT}/{DATASET}"
    TABLE_NAME = "flattened_daily_ga_data_"


class LLMChainConfig(BaseConfig):
    MAX_RESULTS = int(os.getenv("MAX_RESULTS", 20))
    MAX_QUERY_COST_USD = float(os.getenv("MAX_QUERY_COST_USD", 1.055))
    NB_PARALLEL_SQL_GEN = int(os.getenv("NB_PARALLEL_SQL_GEN", 3))
    FF_PROMPT_REFINEMENT_ENABLED = os.getenv("FF_PROMPT_REFINEMENT_ENABLED", "false") == "true"
    FF_PROMPT_EXAMPLE_ROWS = os.getenv("FF_PROMPT_EXAMPLE_ROWS", "true") == "true"
    DATASET_DESCRIPTION_FORMAT = os.getenv("DATASET_DESCRIPTION_FORMAT", "SQL")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") or SecretManager.get_secret("openai-api-key")


base = BaseConfig
database = DatabaseConfig()
langfuse = LangfuseConfig
bigquery = BigQueryConfig
llm_chain = LLMChainConfig
