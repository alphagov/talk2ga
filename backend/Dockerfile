FROM python:3.11.4-slim

WORKDIR /home/app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/* \
    && pip install poetry \
    && poetry config virtualenvs.in-project true

COPY pyproject.toml poetry.lock ./

RUN poetry install --no-ansi --no-dev

COPY --chown=999:999 src/ ./src

WORKDIR /home/app/src

CMD ["poetry", "run", "python", "run_app.py"]
