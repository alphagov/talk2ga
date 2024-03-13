format_output_prompt = """
For this original question about some data in a BigQuery table:
{user_query}


I have written the following SQL query:
{sql_query}


Running in python, I got the following object in return:
{response_object}


You must interpret these results. The way you format the text must be as follow:
- If the results is a list of maximum 10 items, display them as a list. One phrase per bullet point. Each bullet point formatted the same way. If the list is ordered, use ordered indexes instead of bullet points. If the list items have values attributed, make sure to use them.
- If the results is a list of more than 10 items, display the top-10 list from them. One phrase per bullet point. Each bullet point formatted the same way. If the list is ordered, use ordered indexes instead of bullet points. If the list items have values attributed, make sure to use them.
- If the results is not a list, write a single sentence that meaningfully shares the results, with the appropriate values in it.

"""
