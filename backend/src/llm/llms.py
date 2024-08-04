from langchain_google_vertexai import VertexAI
from langchain_openai import ChatOpenAI
import config

text_bison = VertexAI(model_name="text-bison@002", project=config.base.GCP_PROJECT, max_output_tokens=2048)
code_bison_6k = VertexAI(model_name="code-bison@002", project=config.base.GCP_PROJECT, max_output_tokens=2048)
chat_gpt_4_turbo = ChatOpenAI(api_key=config.llm_chain.OPENAI_API_KEY, model="gpt-4-turbo")
gemini_pro = VertexAI(model_name="gemini-pro", project=config.base.GCP_PROJECT)
