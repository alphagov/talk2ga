from webapp.models import Question, QuestionCreate
from sqlmodel.ext.asyncio.session import AsyncSession
from webapp.db import async_session

async def create_question(question: QuestionCreate, session: AsyncSession | None = None):
    if session is None:
        async with async_session() as session:
            db_question = Question.model_validate(question)
            session.add(db_question)
            await session.commit()
            await session.refresh(db_question)
            return db_question
            
    db_question = Question.model_validate(question)
    session.add(db_question)
    await session.commit()
    await session.refresh(db_question)
    return db_question
