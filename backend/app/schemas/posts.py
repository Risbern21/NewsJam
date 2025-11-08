from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, field_validator
from app.schemas.users import UserRead

class PostBase(BaseModel):
    user_id:UUID
    likes:int | None = 0
    dislikes:int | None = 0
    title:str
    content:str
    url:str|None = None

class PostRead(PostBase):
    id:UUID
    user: UserRead | None = None
    created_at: datetime | None = None
    real: bool | None = None
    credibility_score: float | None = None
    
    @field_validator('real', mode='before')
    @classmethod
    def convert_real(cls, v):
        """Convert string 'true'/'false' to bool"""
        if v is None:
            return None
        if isinstance(v, bool):
            return v
        if isinstance(v, str):
            return v.lower() == 'true'
        return None
    
    @field_validator('credibility_score', mode='before')
    @classmethod
    def convert_credibility_score(cls, v):
        """Convert string to float"""
        if v is None:
            return None
        if isinstance(v, (int, float)):
            return float(v)
        if isinstance(v, str):
            try:
                return float(v)
            except ValueError:
                return None
        return None
    
    class Config:
        from_attributes = True
