from langchain_google_vertexai import VertexAI
from llm.config import GCP_PROJECT

text_bison = VertexAI(
    model_name="text-bison@002", project=GCP_PROJECT, max_output_tokens=2048
)
code_bison_6k = VertexAI(
    model_name="code-bison@002", project=GCP_PROJECT, max_output_tokens=2048
)
gemini_pro = VertexAI(model_name="gemini-pro", project=GCP_PROJECT)
