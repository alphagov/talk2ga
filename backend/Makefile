run:
	docker-compose up api

run-local:
	@cd src && poetry run python run_app.py

wipe-db:
	docker-compose down -v && docker-compose up -d db --build

print-env:
	@cd src/webapp && python config.py

ENV ?= local

run-migrations:
	ENV=$(ENV) alembic upgrade head

.PHONY: run print-env run_migrations
