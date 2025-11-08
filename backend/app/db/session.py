import logging
import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s  - %(message)s"
)

logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv("PG_DB")
if DATABASE_URL is None:
    logger.info("database url is none")
    os._exit(1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


async def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        raise
    # logger.info(f"{str(e)}")
    finally:
        db.close()
