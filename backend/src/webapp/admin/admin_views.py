from sqladmin import Admin, ModelView
from starlette.applications import Starlette
from webapp.models import Question


class QuestionAdmin(ModelView, model=Question):
    column_list = [
        Question.text,
        Question.succeeded,
        Question.error_msg,
        # Question.logs_json,
        Question.final_output,
        Question.duration,
        Question.username,
        Question.user_email,
        Question.has_feedback,
        Question.is_feedback_positive,
        Question.feedback_text,
        Question.suggested_sql_correction,
        Question.explanations,
        Question.executed_sql_query,
        Question.generated_sql_queries,
    ]


def get_admin_classes():
    return [QuestionAdmin]
