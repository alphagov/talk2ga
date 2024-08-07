import json
from pathlib import Path


def get_text_knowledge_base():
    """
    Returns the content of the textfile knowledge base
    This knowledge base contains info on the data set and on how to write queries
    """
    with open("llm/static/knowledge_base/knowledge-base.txt", "r") as f:
        return f.read()


def get_smart_answers_knowledge_base():
    """
    Returns the content of the smart answers knowledge base
    This knowledge base contains the THEME => SLUG mapping
    """
    with open("llm/static/knowledge_base/smart-answers-slugs.json", "r") as f:
        return f.read()


def get_schema_description(schema_type="json"):
    """
    Returns the content of the schema description knowledge base
    This knowledge base contains JSON schema description of the BigQuery dataset
    """

    assert schema_type.lower() in [
        "json",
        "txt",
        "sql",
    ], "Invalid schema description type. Must be json, txt or sql."

    file = f"llm/static/schema-description.{schema_type.lower()}"
    with open(file, "r") as f:
        return f.read()


def get_schema_columns():
    """
    Returns the columns of the table
    """
    schema = json.loads(get_schema_description(schema_type="json"))
    schema_columns = [col["name"] for col in schema]
    return schema_columns


def get_example_queries():
    directory_path = Path("llm/static/knowledge_base/sql_examples")

    files = [file.read_text() for file in directory_path.iterdir() if file.is_file() and file.name.endswith(".sql") and file.name != "TEMPLATE.sql"]

    compiled_files = "\n".join(files)

    return f"""Some example queries to get you started:
        {'-'*40}
        {compiled_files}"""
