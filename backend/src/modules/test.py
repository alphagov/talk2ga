from modules.llm_chains import generate_sql
from modules import config, evaluation, formatting, db
from modules.knowledge_bases import get_text_knowledge_base, get_schema_description
from modules.prompts.smart_answers import smart_answers_prompt


"""

1. define the question
2. get the sql for it
3. extract the SQL from the output
4. get the response object
5. validate the response object for this question

"""


def default_generate_sql(question):
    return generate_sql.chain.invoke(
        {
            "DATASET": config.DATASET,
            "schema_description": get_schema_description(),
            "user_query": question,
            "knowledge_base": get_text_knowledge_base(),
        }
    )


class Q0:
    question = """
    What is the most visited page?
    """

    def run(self):
        sql_output = default_generate_sql(self.question)

        while not evaluation.is_valid_sql(sql_output):
            print("Invalid SQL output, retrying...")
            sql_output = default_generate_sql(self.question)

        pure_sql = formatting.remove_sql_quotes(sql_output)

        response_object = db.query_sql(pure_sql)
        print("response_object: ", response_object)

        assert (
            response_object[0]["page_views"] >= 290000
        ), f"""Error in test Q0:\nAssert: response_object[0]["page_views"] >= 300000\nResponse object: {response_object}"""


class Q1:
    question = """
    Given the page of URL = https://www.gov.uk/guidance/send-an-income-tax-relief-claim-for-job-expenses-by-post-or-phone
    How popular is it, based on unique page views?
    """

    def run(self):
        sql_output = default_generate_sql(self.question)

        while not evaluation.is_valid_sql(sql_output):
            print("Invalid SQL output, retrying...")
            sql_output = default_generate_sql(self.question)

        pure_sql = formatting.remove_sql_quotes(sql_output)

        print("pure:\n", pure_sql)

        response_object = db.query_sql(pure_sql)
        print("response_object: ", response_object)

        assert response_object[0]["unique_page_views"] == 430


class Q2:
    question = """
    Where do users come from the most, when landing on that page: https://www.gov.uk/guidance/send-an-income-tax-relief-claim-for-job-expenses-by-post-or-phone
    """

    def run(self):
        sql_output = default_generate_sql(self.question)

        while not evaluation.is_valid_sql(sql_output):
            print("Invalid SQL output, retrying...")
            sql_output = default_generate_sql(self.question)

        with open("./sql_output.txt", "w") as f:
            f.write(sql_output)

        pure_sql = formatting.remove_sql_quotes(sql_output)

        with open("./pure_sql.txt", "w") as f:
            f.write(pure_sql)

        print("pure:\n", pure_sql)

        response_object = db.query_sql(pure_sql)
        print("response_object: ", response_object)

        key_name = [x for x in list(response_object[0].keys()) if "views" in x.lower()][
            -1
        ] or "unique_page_views"

        assert (
            response_object[0][key_name] > 280 and response_object[0][key_name] < 400
        ), "Error in test Q2: assert response_object[0][key_name] == 430"


class Q3:
    question = """
    What are the most visited pages on the smart answer regarding VAT payment dates?
    """

    def run(self):
        sql_output = default_generate_sql(smart_answers_prompt(self.question))

        while not evaluation.is_valid_sql(sql_output):
            print("Invalid SQL output, retrying...")
            sql_output = default_generate_sql(self.question)

        pure_sql = formatting.remove_sql_quotes(sql_output)

        print("pure:\n", pure_sql)

        response_object = db.query_sql(pure_sql)
        print("response_object: ", response_object)

        assert (
            len(response_object) == 11
        ), "Error in test Q3: len(response_object) == 11"

        assert "deadline" in response_object[0]["page_title"].lower()


class Q4:
    question = """
    
    """

    def run(self):
        sql_output = default_generate_sql(smart_answers_prompt(self.question))

        while not evaluation.is_valid_sql(sql_output):
            print("Invalid SQL output, retrying...")
            sql_output = default_generate_sql(self.question)

        pure_sql = formatting.remove_sql_quotes(sql_output)

        print("pure:\n", pure_sql)

        response_object = db.query_sql(pure_sql)
        print("response_object: ", response_object)

        assert (
            len(response_object) == 11
        ), "Error in test Q3: len(response_object) == 11"

        assert "deadline" in response_object[0]["page_title"].lower()


TESTS = [Q0, Q1, Q2, Q3]


def run_test_suite():
    errors = []
    test_results = {}

    for Test in TESTS:
        print(
            f"""
\n\n\n
##############

Test {Test.__name__}:
{Test.question}

##############  
              """
        )
        try:
            testable = Test()
            test_results[Test.__name__] = {
                "question": Test.question,
            }
            testable.run()
            test_results[Test.__name__]["status"] = "PASSED"
        except Exception as e:
            test_results[Test.__name__]["status"] = "FAILED"
            print("\n\nERROR in test: ", Test.__name__)
            print("Question: ", testable.question)
            print(e)
            print("\n")
            errors.append(e)

    print("\n\n\n")
    text_output = []
    for test_name, result in test_results.items():
        res = f"{test_name}: "
        res += "..... Passed ✅" if result["status"] == "PASSED" else "..... Failed ❌"
        text_output.append(res)

    print("\n".join(text_output))

    return errors
