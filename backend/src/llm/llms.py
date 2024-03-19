from langchain_google_vertexai import VertexAI
from llm.config import GCP_PROJECT

chat_bison = VertexAI(model_name="text-bison", project=GCP_PROJECT)
code_bison_6k = VertexAI(model_name="code-bison", project=GCP_PROJECT)
gemini_pro = VertexAI(model_name="gemini-pro", project=GCP_PROJECT)
