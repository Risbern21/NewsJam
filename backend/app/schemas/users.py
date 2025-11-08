from pydantic import BaseModel, EmailStr
from uuid import UUID


class UserBase(BaseModel):
    username:str
    email:EmailStr

class UserCreate(UserBase):
    hashed_password:str

class UserRead(UserBase):
    id:UUID

    class Config:
        from_attributes = True  # Pydantic v2 syntax (was orm_mode in v1)
        
class UserUpdate(BaseModel):
    hashed_password:str