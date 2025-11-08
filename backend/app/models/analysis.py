import uuid

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID

from app.db.session import Base
from app.models.posts import Post
from app.models.users import User


class Analysis(Base):
    __tablename__ = "analysis"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID, ForeignKey(User.id, ondelete="CASCADE"))
    post_id = Column(UUID, ForeignKey(Post.id, ondelete="CASCADE"))
    credibility_score = Column(Integer)
