from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session

from app.schemas.posts import PostBase, PostRead

from uuid import UUID
from app.models.users import User
from app.crud import posts

from app.api.v1.auth import get_current_user
from app.db.session import get_db

from app.core.image import extractTextFromImage
from typing import List

router = APIRouter(prefix="/posts",tags=["posts"])

@router.post("/")
def create_post(post:PostBase,
                current_user: User = Depends(get_current_user),
                db:Session = Depends(get_db)):
    # extractTextFromImage()
    return posts.create_post(post=post,db=db)

@router.get("/{p_id}")
def get_post(
    p_id:UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return posts.get_post(p_id=p_id,db=db)

@router.get("/", response_model=List[PostRead])
def get_all_posts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return posts.get_posts(db=db)

@router.get("/user/me", response_model=List[PostRead])
def get_my_posts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all posts created by the current user"""
    return posts.get_posts_by_user(user_id=current_user.id, db=db)

@router.put("/{p_id}")
def update_post(
    p_id:UUID,
    post:PostBase,
    current_user: User = Depends(get_current_user),
    db:Session=Depends(get_db)
):
    return posts.update_post(post_id=p_id,post=post,db=db)

@router.delete("/{p_id}")
def delete_post(
    p_id:UUID,
    current_user: User = Depends(get_current_user),
    db:Session=Depends(get_db)
):
    return posts.delete_post(post_id=p_id,db=db)