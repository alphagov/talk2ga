from datetime import datetime
from sqladmin import ModelView
from webapp.models import Question


def convert_date_to_readable(model, attribute) -> str:
    dt = datetime.fromisoformat(str(model.created_at))
    readable_date = dt.strftime("%d-%m-%Y %H:%M:%S")
    return readable_date


class QuestionAdmin(ModelView, model=Question):
    can_create = False
    can_edit = False
    can_delete = False

    column_list = [
        Question.created_at,
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

    column_formatters = {Question.created_at: convert_date_to_readable}


def get_admin_classes():
    return [QuestionAdmin]
