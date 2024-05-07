from langchain_google_vertexai import VertexAI
from langchain_openai import ChatOpenAI
from appconfig import GCP_PROJECT, OPENAI_API_KEY

text_bison = VertexAI(
    model_name="text-bison@002", project=GCP_PROJECT, max_output_tokens=2048
)
code_bison_6k = VertexAI(
    model_name="code-bison@002", project=GCP_PROJECT, max_output_tokens=2048
)
chat_gpt_4_turbo = ChatOpenAI(api_key=OPENAI_API_KEY, model="gpt-4-turbo")
gemini_pro = VertexAI(model_name="gemini-pro", project=GCP_PROJECT)
