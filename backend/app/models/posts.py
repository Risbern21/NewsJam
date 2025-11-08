import uuid
from datetime import datetime

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.models.users import User

from app.db.session import Base

from sqlalchemy.orm import relationship

class Post(Base):
    __tablename__ = "posts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID, ForeignKey(User.id, ondelete="CASCADE"))
    likes = Column(Integer, default=0)
    dislikes = Column(Integer, default=0)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    real = Column(String, nullable=True)  # 'true' or 'false' as string for compatibility
    credibility_score = Column(String, nullable=True)  # Store as string to preserve precision

    user = relationship("User", back_populates="posts")