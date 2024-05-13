from google.cloud import bigquery
from langchain.sql_database import SQLDatabase
from appconfig import SQLALCHEMY_URL, GCP_PROJECT
from llm.flags import _observe
from utils.side_effects import run_async_side_effect
from webapp import analytics_controller


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


@_observe()
def query_sql(sql, question_id):
    """
    Execute a SQL query against a BQ dataset and return the result as a list of dictionaries
    """
    run_async_side_effect(
        analytics_controller.add_executed_query_to_question,
        question_id,
        sql,
        fresh_session=True,
    )
    query_job = client.query(sql)
    rows = query_job.result()  # Waits for query to finish
    return [dict(row.items()) for row in rows]
