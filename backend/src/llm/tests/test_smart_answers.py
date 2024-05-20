from llm.prompts.smart_answers import pertains_to_smart_answers


def assert_smart_answers(
    file_path_smart="llm/tests/smart_answers.txt",
    file_path_non_smart="llm/tests/non_smart_answers.txt",
):
    with open(file_path_smart, "r") as file:
        smart_answers = file.readlines()
    smart_answers = [answer.strip() for answer in smart_answers]

    with open(file_path_non_smart, "r") as file:
        non_smart_answers = file.readlines()
    non_smart_answers = [answer.strip() for answer in non_smart_answers]

    for answer in smart_answers:
        assert pertains_to_smart_answers(answer), f"Assertion failed: {answer} is not a smart answer"

    for answer in non_smart_answers:
        assert not pertains_to_smart_answers(answer), f"Assertion failed: {answer} is a smart answer"

    print("All smart answers assertions passed successfully!")
