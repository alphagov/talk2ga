from fastapi import FastAPI
from sqladmin import Admin
from .admin_views import get_admin_classes


def add_admin_dashboard(app: FastAPI, engine):
    admin = Admin(app, engine)

    for _class in get_admin_classes():
        admin.add_view(_class)

    return admin
