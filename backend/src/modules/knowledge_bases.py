def get_text_knowledge_base():
    """
    Returns the content of the textfile knowledge base
    This knowledge base contains info on the data set and on how to write queries
    """
    with open("static/knowledge-base.txt", "r") as f:
        return f.read()


def get_smart_answers_knowledge_base():
    """
    Returns the content of the smart answers knowledge base
    This knowledge base contains the THEME => SLUG mapping
    """
    with open("static/knowledge-base-smart-answers-slugs.json", "r") as f:
        return f.read()


def get_schema_description():
    """
    Returns the content of the schema description knowledge base
    This knowledge base contains JSON schema description of the BigQuery dataset
    """
    with open("static/schema-description.txt", "r") as f:
        return f.read()
