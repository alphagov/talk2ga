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


app.mount("/static", StaticFiles(directory="/Users/guilhemforey/GDS/talk2ga/backend/src/webapp/static"), name="static")

@app.get("/")
def hello_world():
    return HTMLResponse(content=open("webapp/static/index.html").read(), status_code=200)


def run_server():
    import uvicorn

    print("Running server...")
    uvicorn.run("webapp.app:app", host="0.0.0.0", port=80, reload=True)
    print("Server running :check:")
