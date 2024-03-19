from sqlmodel import create_engine, SQLModel, Session

postgres_url = "postgresql://local:local@127.0.0.1:5433/local"

engine = create_engine(postgres_url, echo=True)


def init_db():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session