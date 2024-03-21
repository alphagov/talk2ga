FROM python:3.11.4-slim

WORKDIR /home/app


RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    python3-dev \
    libpq-dev
RUN pg_config --version
RUN pip install poetry
RUN poetry config virtualenvs.in-project true
COPY pyproject.toml ./
COPY poetry.lock ./
RUN poetry install --no-ansi

COPY --chown=999:999 src/ ./src

WORKDIR /home/app/src

CMD ["poetry", "run", "python", "run_app.py"]
