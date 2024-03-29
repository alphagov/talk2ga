from google.cloud import bigquery
from langchain.sql_database import SQLDatabase
from llm.config import SQLALCHEMY_URL, GCP_PROJECT


_cache = {}
connection_key = "db_connection"


def create_connection():
    print("Connecting to the database...")
    db_conn = SQLDatabase.from_uri(SQLALCHEMY_URL)
    print("Connected to the database\n\n")
    _cache[connection_key] = db_conn
    return db_conn


def get_connection(fresh: bool = False):
    if fresh:
        return create_connection()

    if _cache.get("connection_key", None):
        return _cache[connection_key]


client = bigquery.Client(project=GCP_PROJECT)


def query_sql(sql):
    """
    Execute a SQL query against a BQ dataset and return the result as a list of dictionaries
    """
    query_job = client.query(sql)
    rows = query_job.result()  # Waits for query to finish
    return [dict(row.items()) for row in rows]


def query_sql_trial(input):
    """
    Execute a SQL query against a BQ dataset and return the result as a list of dictionaries
    """
    if "pure_sql" not in input:
        raise Exception('Missing key in input: "pure_sql"')
    query_job = client.query(input["pure_sql"])
    rows = query_job.result()  # Waits for query to finish
    return [dict(row.items()) for row in rows]
