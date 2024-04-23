import pretty_errors
from typing import List
import json
import argparse
from llm.whole_chain import whole_chain

"""

1. define the question
2. get the sql for it
3. extract the SQL from the output
4. get the response object
5. validate the response object for this question

"""


class Q:
    question = ""
    decsription = ""
    verbose = False
    callback_data: dict = {}

    def __init__(self, options: dict = {}):
        self.options = options

        if options.get("verbose"):
            self.verbose = True

    def run(self):
        raise Exception("Not implemented")

    def test_callback(self, data):
        self.callback_data = data
        if self.verbose:
            print(json.dumps(self.callback_data, indent=4))


class Q0(Q):
    description = (
        "Should return an object with 290k+ page_views, and not use correction"
    )
    question = """What is the most viewed page?"""

    def run(self):

        response_object = whole_chain.invoke(
            json.dumps(
                {
                    "question": self.question,
                    "dateRange": {
                        "start_date": "2024-04-09",
                        "end_date": "2024-04-09",
                    },
                }
            ),
            test_callback=self.test_callback,
        )

        response_object = self.callback_data["response_object"]

        assert (
            response_object[0]["page_views"] >= 290000
        ), f"""Error in test Q0:\nAssert: response_object[0]["page_views"] >= 300000\nResponse object: {response_object}"""

        assert not self.callback_data["was_corrected"]


TESTS = [Q0]


def run_test_suite(options: dict = {}):
    errors: List[str] = []
    test_results = {}

    for Test in TESTS:
        print(
            f"""
\n\n\n
##############

Test {Test.__name__}:
{Test.question}
------------------------
{Test.description}

##############
              """
        )
        try:
            testable = Test(options)
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
            raise e

    print("\n\n\n")
    text_output = []
    for test_name, result in test_results.items():
        res = f"{test_name}: "
        res += "..... Passed ✅" if result["status"] == "PASSED" else "..... Failed ❌"
        text_output.append(res)

    print("\n".join(text_output))

    return errors


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "-v", "--verbose", action="store_true", help="Enable verbose mode"
    )
    args = parser.parse_args()

    options = {}

    if args.verbose:
        options["verbose"] = True

    run_test_suite(options)
