#!/usr/bin/env python
import os
import json
from typing import Any, Dict
from fastapi import FastAPI, Depends, Request
from fastapi.responses import StreamingResponse

from langserve import add_routes
from langchain_core.messages import AIMessageChunk

from llm.llm_chains.generate_sql import gen as generate_sql

from llm import db
from llm.whole_chain import whole_chain
from llm.llm_chains.explain import explain_sql_chain

from fastapi.middleware.cors import CORSMiddleware

from fastapi.responses import HTMLResponse
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from webapp.analytics_controller import create_question


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


def add_uid_to_response(response, question_id):
    response.headers["X-Question-UID"] = question_id
    return response


def add_uid_to_request_state(request: Request, question_id):
    request.state.question_id = question_id
    return request


@app.middleware("http")
async def create_question_and_add_id_to_res_and_req(request: Request, call_next):
    if request.url.path == "/whole-chain/stream_log":
        body = await request.json()
        question = Question(**{"text": body["input"]})
        question = await create_question(question)
        request = add_uid_to_request_state(request, question.id)

    response = await call_next(request)

    if request.url.path == "/whole-chain/stream_log":
        response = add_uid_to_response(response, question.id)

    return response


def pass_question_id_to_chain(config: Dict[str, Any], request: Request) -> Dict[str, Any]:
    if qid := request.state.question_id:
        config["question_id"] = qid
    else:
        raise HTTPException(401, "No question ID provided")

    return config


add_routes(
    app,
    generate_sql,
    path="/generate-sql",
)

add_routes(
    app,
    whole_chain.with_types(input_type=str, output_type=str),
    path="/whole-chain",
    per_req_config_modifier=pass_question_id_to_chain,
)


add_routes(
    app,
    explain_sql_chain.with_types(input_type=str, output_type=str),
    path="/explain",
)


async def generate_chat_events(input):
    events_allow_list = ["on_chain_start", "on_chain_end"]
    async for event in whole_chain.astream_events(input, version="v1"):
        if event.get("event") in events_allow_list and event.get("data") and "prompt" not in event.get("name", "").lower():
            obj = {"event_type": event["event"], "event_name": event["name"]}
            try:
                if output := event["data"].get("output"):
                    obj["output"] = output
            except Exception as e:
                raise e
            json_obj = json.dumps(obj)
            try:
                yield f"data: {json_obj}\n\n"
            except Exception as e:
                raise e


@app.post("/call_custom_chain")
async def call_custom_chain(request: Request):
    body = await request.json()
    input = body.get("input")
    # config = body.get("config", {})
    return StreamingResponse(generate_chat_events(input), media_type="text/event-stream")


#######
#
# Questions API endpoints
#
#######

from fastapi import FastAPI, HTTPException
from webapp.models import Question, QuestionRead, QuestionCreate, QuestionUpdate
from webapp.db import get_session, init_db
from sqlmodel.ext.asyncio.session import AsyncSession


@app.post("/question", response_model=QuestionRead)
async def create_question_handler(question: QuestionCreate, session: AsyncSession = Depends(get_session)):
    db_question = Question.model_validate(question)
    session.add(db_question)
    await session.commit()
    await session.refresh(db_question)
    return db_question


# returns 404 if not found
# update existing row, not create new one
@app.put("/question/{question_id}", response_model=QuestionRead)
async def update_question_handler(
    question_id: str,
    question: QuestionUpdate,
    session: AsyncSession = Depends(get_session),
):
    db_question = await session.get(Question, question_id)
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
    question_data = question.model_dump(exclude_unset=True)
    db_question.sqlmodel_update(question_data)
    session.add(db_question)
    await session.commit()
    await session.refresh(db_question)
    return db_question


@app.get("/question/{question_id}", response_model=QuestionRead)
async def read_question_handler(question_id: str, session: AsyncSession = Depends(get_session)):
    db_question = await session.get(Question, question_id)
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
    return db_question


app.mount("/static", StaticFiles(directory=os.path.join("webapp", "static")), name="static")


@app.get("/")
def hello_world():
    return HTMLResponse(content=open("webapp/static/index.html").read(), status_code=200)


@app.on_event("startup")
async def on_startup():
    await init_db()


def run_server():
    import uvicorn

    print("Running server...")
    uvicorn.run("webapp.app:app", host="0.0.0.0", port=80, reload=True)
    print("Server running :check:")
