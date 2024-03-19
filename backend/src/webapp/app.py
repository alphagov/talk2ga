#!/usr/bin/env python
from fastapi import FastAPI

from langserve import add_routes

from modules.llm_chains.generate_sql import chain as generate_sql

from modules import db
from deleteme import whole_chain

from fastapi.middleware.cors import CORSMiddleware

from fastapi.responses import HTMLResponse
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles


app = FastAPI(
    title="LangChain Server",
    version="1.0",
    description="A simple api server using Langchain's Runnable interfaces",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

add_routes(
    app,
    generate_sql,
    path="/generate-sql",
)

add_routes(
    app,
    whole_chain.with_types(input_type=str, output_type=str),
    path="/whole-chain",
)

#######
#
# Questions API endpoints
#
#######

from pydantic import BaseModel
from fastapi.encoders import jsonable_encoder
from google.cloud import bigquery
from modules.config import GCP_PROJECT
from webapp.config import get_dataset_url
from datetime import datetime
import pytz
from sqlmodel import Field, Session, SQLModel, create_engine, select
import sqlalchemy as sa
from fastapi import FastAPI, HTTPException
import uuid
from webapp.models import Question, QuestionRead, QuestionCreate, QuestionUpdate
from webapp.db import get_session, init_db



@app.post("/question", response_model=QuestionRead)
def create_question(question: QuestionCreate):
    with get_session() as session:
        db_question = Question.model_validate(question)
        session.add(db_question)
        session.commit()
        session.refresh(db_question)
        return db_question


# returns 404 if not found
# update existing row, not create new one
@app.put("/question/{question_id}", response_model=QuestionRead)
def create_question(question_id: str, question: QuestionUpdate):
    with get_session() as session:
        db_question = session.get(Question, question_id)
        if not db_question:
            raise HTTPException(status_code=404, detail="Question not found")
        question_data = question.model_dump(exclude_unset=True)
        db_question.sqlmodel_update(question_data)
        session.add(db_question)
        session.commit()
        session.refresh(db_question)
        return db_question


@app.get("/question/{question_id}", response_model=QuestionRead)
def create_question(question_id: str):
    with get_session() as session:
        db_question = session.get(Question, question_id)
        if not db_question:
            raise HTTPException(status_code=404, detail="Question not found")
        return db_question
        


app.mount("/static", StaticFiles(directory="/Users/guilhemforey/GDS/talk2ga/backend/src/webapp/static"), name="static")

@app.get("/")
def hello_world():
    return HTMLResponse(content=open("webapp/static/index.html").read(), status_code=200)




def run_server():
    import uvicorn

    init_db()

    print("Running server...")
    uvicorn.run("webapp.app:app", host="0.0.0.0", port=80, reload=True)
    print("Server running :check:")
