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


NB_RUNS = 3


class Q:
    question = ""
    decsription = ""
    output = ""
    verbose = False
    callback_data: dict = {}

    def __init__(self, options: dict = {}):
        self.options = options

        if options.get("verbose"):
            self.verbose = True

    def run(self):
        self.run_chain()
        self.test()

    def run_chain(self):
        self.output = whole_chain.invoke(
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

    def test(self):
        raise Exception("Not implemented")

    def test_callback(self, data):
        self.callback_data = data
        self.response_object = self.callback_data["response_object"]
        if self.verbose:
            print(json.dumps(self.callback_data, indent=4))

    def __str__(self):
        return f"""
\n\n\n
##############

Test {self.__class__.__name__}:
{self.question}
------------------------
{self.description}

##############
              """


class Q1(Q):
    question = """What is the most viewed page?"""
    description = (
        "Should return an object with 290k+ page_views, and not use correction"
    )

    def test(self):
        assert (
            self.response_object[0]["page_views"] >= 290000
        ), f"""Error in test Q0:\nAssert: response_object[0]["page_views"] >= 300000\nResponse object: {self.response_object}"""

        assert not self.callback_data["was_corrected"]
        assert not self.callback_data["retried"]


class Q1a(Q):
    question = """What is the most visited page?"""
    description = (
        "Should return an object with 290k+ page_views, and not use correction"
    )

    def test(self):
        assert (
            self.response_object[0]["page_views"] >= 290000
        ), f"""Error in test Q0:\nAssert: response_object[0]["page_views"] >= 300000\nResponse object: {self.response_object}"""

        assert not self.callback_data["was_corrected"]


class Q2(Q):
    question = """
    Given the page of URL = https://www.gov.uk/guidance/send-an-income-tax-relief-claim-for-job-expenses-by-post-or-phone
    How popular is it, based on unique page views?
    """
    description = "Should return an object with ### unique_page_views"  # TODO

    def test(self):
        assert self.response_object[0]["unique_page_views"] == 430  # TODO


class Q3(Q):
    question = """
    Where do users come from the most, when landing on that page: https://www.gov.uk/guidance/send-an-income-tax-relief-claim-for-job-expenses-by-post-or-phone
    """
    description = "Should return an object with the most popular source of traffic, between XXX and XXX"  # TODO

    def test(self):
        key_name = [
            x for x in list(self.response_object[0].keys()) if "views" in x.lower()
        ][-1] or "unique_page_views"

        assert (
            self.response_object[0][key_name] > 280
            and self.response_object[0][key_name] < 400  # TODO
        ), "Error in test Q3: assert response_object[0][key_name] == 430"  # TODO


class Q4(Q):
    question = """
    What are the most visited pages on the smart answer regarding VAT payment dates?
    """
    description = (
        'Should return an object of length 11, with "deadline" in the page title"'
    )

    def test(self):
        assert (
            len(self.response_object) == 11
        ), "Error in test Q3: len(self.response_object) == 11"

        assert "deadline" in self.response_object[0]["page_title"].lower()


TESTS = [Q1, Q2, Q3, Q4]


def format_test_passed(name, passed):
    s = f"{name}: "
    s += "..... Passed ✅" if passed else "..... Failed ❌"
    return s


def run_test_suite(options: dict = {}):
    errors: List[str] = []
    test_results = {}

    for Test in TESTS:
        testable = Test(options)
        print(testable)
        test_name = Test.__name__
        results = []

        for _ in range(NB_RUNS):
            try:
                testable.run()
                results.append({"passed": True})
            except Exception as e:
                results.append({"passed": False, "error": e})
                errors.append(e)

        passed = True if all([x["passed"] for x in results]) else False

        test_results[test_name] = {
            "passed": passed,
            "question": Test.question,
            "class": Test,
            "results": results,
        }

        print(format_test_passed(test_name, passed))

    print("\n\n\n")
    for test_name, result in test_results.items():
        print(format_test_passed(test_name, result["passed"]))

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
