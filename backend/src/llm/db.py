from google.cloud import bigquery
from langchain.sql_database import SQLDatabase
from appconfig import SQLALCHEMY_URL, GCP_PROJECT
from llm.flags import _observe
from utils.side_effects import run_async_side_effect
from webapp import analytics_controller
import appconfig


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


def get_query_size_bytes(sql):
    dry_run_config = bigquery.QueryJobConfig(
        dry_run=True,
        use_query_cache=False,
    )
    query_job = client.query(sql, job_config=dry_run_config)
    return query_job.total_bytes_processed


def get_query_cost_usd(sql):
    COST_1TB_USD = 5.0
    query_size_GBs = get_query_size_bytes(sql) / 1e9
    cost_usd = query_size_GBs * COST_1TB_USD / 1e3
    return cost_usd


class QueryCostExceedsLimit(Exception):
    pass


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

    cost_usd = get_query_cost_usd(sql)
    print(f"Query cost: ${cost_usd}")
    if cost_usd > appconfig.MAX_QUERY_COST_USD:
        raise QueryCostExceedsLimit(f"Query cost exceeds the limit. Cost: {cost_usd}, Limit: {appconfig.MAX_QUERY_COST_USD}, Question ID: {question_id}")

    query_job = client.query(sql)
    rows = query_job.result()  # Waits for query to finish
    results = [dict(row.items()) for row in rows]
    truncated_results = results[: appconfig.MAX_RESULTS]

    return truncated_results
