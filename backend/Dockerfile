FROM python:3.11.4-slim

WORKDIR /home/app

COPY pyproject.toml ./
COPY poetry.lock ./

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        gcc \
        python3-dev \
        libpq-dev
RUN pg_config --version
RUN pip install poetry
RUN poetry config virtualenvs.in-project true
RUN poetry install --no-ansi

# COPY --chown=999:999 client/ client/

COPY --chown=999:999 experiments/05-bq-vertex-ga4-full-dataset--guilhem/bigquery-notebook .

CMD ["poetry", "run", "python", "run_app.py"]
