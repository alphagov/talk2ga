import re


def remove_sql_quotes(input: str) -> str:
    """
    Now extract the SQL language only from the prompt result
    """
    # # Regex pattern to find SQL structure
    # sql_pattern = r"```sql\s*([\s\S]*?)\s*```"

    # # Find all matches in the input string
    # matches = re.findall(sql_pattern, input)

    relevant_str = input

    if "```sql" in relevant_str:
        relevant_str = input.split("```sql")[1]

    if "```" in relevant_str:
        relevant_str = relevant_str.split("```")[0]
    

    relevant_str = relevant_str.strip().replace("\n", " ")

    # Return the first match or an empty string if no match is found
    # if len(matches) > 0 and matches[0]:
    #     return matches[0]
    # else:
    #     print("No SQL quotes found, returning the same input")
    #     return input

    return relevant_str
