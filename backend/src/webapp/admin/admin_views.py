from datetime import datetime
from sqladmin import ModelView
from webapp.models import Question


def convert_date_to_readable(model, attribute) -> str:
    dt = datetime.fromisoformat(str(model.created_at))
    readable_date = dt.strftime("%d-%m-%Y %H:%M:%S")
    return readable_date


class QuestionAdmin(ModelView, model=Question):
    page_size = 100
    page_size_options = [10, 25, 50, 100, 200, 500]

    column_default_sort = ("created_at", True)
    column_sortable_list = ["created_at", "succeeded", "username", "user_email", "has_feedback", "is_feedback_positive"]

    can_create = False
    can_edit = False
    can_delete = False

    column_list = [
        Question.created_at,
        Question.succeeded,
        Question.text,
        Question.final_output,
        Question.executed_sql_query,
        Question.error_msg,
        # Question.logs_json,
        Question.duration,
        Question.username,
        Question.user_email,
        Question.has_feedback,
        Question.is_feedback_positive,
        Question.feedback_text,
        Question.suggested_sql_correction,
        Question.explanations,
        Question.generated_sql_queries,
    ]

    column_labels = {
        Question.created_at: "Created At",
        Question.text: "Question & Date Range",
        Question.succeeded: "Succeeded",
        Question.error_msg: "Error Message",
        Question.logs_json: "Logs JSON",
        Question.final_output: "Given Answer",
        Question.duration: "Duration",
        Question.username: "Username",
        Question.user_email: "User Email",
        Question.has_feedback: "Has Feedback",
        Question.is_feedback_positive: "Is Feedback Positive",
        Question.feedback_text: "User Text Feedback",
        Question.suggested_sql_correction: "Suggested SQL Correction",
        Question.explanations: "SQL Explanations",
        Question.executed_sql_query: "SQL Query",
    }

    column_formatters = {Question.created_at: convert_date_to_readable}


def get_admin_classes():
    return [QuestionAdmin]
