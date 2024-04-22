from llm.knowledge_bases import get_smart_answers_knowledge_base


smart_answers_prompt_fragment = f"""


If the question pertains to the concept of "smart answers", then consider the following, otherwise ignore:

Smart answers are dynamic online tools that simplify complex government information into easy-to-understand, tailored responses based on users' individual circumstances, in the shape of a dynamic online form.
A smart answer has a base slug in its URL, consistent throughout the smart answer journey.

In order to know which URL slug to use for a specific smart answer, you can refer to the following mapping from smart answer theme to slug:

{get_smart_answers_knowledge_base()}

For example, if the smart answer pertains to the theme holiday entitlement, then the slug to use is "/calculate-your-holiday-entitlement", because the JSON mapping contains the following entry:
```json
"Calculate holiday entitlement ": "/calculate-your-holiday-entitlement"
```

And therefore the SQL query should contain the following line:

```sql
WHERE cleaned_page_location LIKE '/calculate-your-holiday-entitlement%'
```
"""


def smart_answers_prompt(question):
    return f"""
    {question}

    {smart_answers_prompt_fragment}
    """


from fuzzywuzzy import fuzz


def normalize_input(input_string):
    """Normalize the input string by removing spaces and hyphens, and converting to lower case."""
    return input_string.replace(" ", "").replace("-", "").lower()


def pertains_to_smart_answers(input_string):
    """Check if the input string pertains to the concept of 'smart answer', allowing for fuzzy matching."""
    target_concept = "smartanswer"
    normalized_input = normalize_input(input_string)

    match_score = fuzz.partial_ratio(normalized_input, target_concept)

    return match_score >= 90
