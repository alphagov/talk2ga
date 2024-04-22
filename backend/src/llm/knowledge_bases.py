import json


def get_text_knowledge_base():
    """
    Returns the content of the textfile knowledge base
    This knowledge base contains info on the data set and on how to write queries
    """
    with open("llm/static/knowledge-base.txt", "r") as f:
        return f.read()


def get_smart_answers_knowledge_base():
    """
    Returns the content of the smart answers knowledge base
    This knowledge base contains the THEME => SLUG mapping
    """
    with open("llm/static/knowledge-base-smart-answers-slugs.json", "r") as f:
        return f.read()


def get_schema_description(type="json"):
    """
    Returns the content of the schema description knowledge base
    This knowledge base contains JSON schema description of the BigQuery dataset
    """

    file = f"llm/static/schema-description.{'json' if type == 'json' else 'txt'}"
    with open(file, "r") as f:
        return f.read()


def get_schema_columns():
    """
    Returns the columns of the table
    """
    schema = json.loads(get_schema_description())
    schema_columns = [col["name"] for col in schema]
    return schema_columns
