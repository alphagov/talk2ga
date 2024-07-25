from starlette.responses import RedirectResponse, Response
from starlette.requests import Request

from fastapi import FastAPI
from sqladmin import Admin
from .admin_views import get_admin_classes


def add_admin_dashboard(app: FastAPI, engine):
    admin = Admin(app, engine, title="Ask Analytics Admin")

    for _class in get_admin_classes():
        admin.add_view(_class)

    @admin.app.route("/admin")
    async def redirect_to_question(request: Request) -> Response:
        return RedirectResponse("/admin/question/list")

    return admin
