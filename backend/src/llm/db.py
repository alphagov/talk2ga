import config
from google.cloud import bigquery
from llm.flags import _observe
from utils.side_effects import run_async_side_effect
from webapp import analytics_controller


client = bigquery.Client(project=config.base.GCP_PROJECT)


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
    if cost_usd > config.llm_chain.MAX_QUERY_COST_USD:
        raise QueryCostExceedsLimit(f"Query cost exceeds the limit. Cost: {cost_usd}, Limit: {config.llm_chain.MAX_QUERY_COST_USD}, Question ID: {question_id}")

    query_job = client.query(sql)
    rows = query_job.result()  # Waits for query to finish
    results = [dict(row.items()) for row in rows]
    truncated_results = results[: config.llm_chain.MAX_RESULTS]

    return truncated_results
