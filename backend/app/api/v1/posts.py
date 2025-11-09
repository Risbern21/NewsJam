from fastapi import APIRouter,Depends, Query, Form
from sqlalchemy.orm import Session

from app.schemas.posts import PostBase, PostRead

from uuid import UUID
from app.models.users import User
from app.crud import posts

from app.api.v1.auth import get_current_user
from app.db.session import get_db

from app.core.image import extractTextFromImage
from typing import List, Optional
from fastapi import FastAPI, File, UploadFile, HTTPException
import time

router = APIRouter(prefix="/posts",tags=["posts"])

@router.post("/")
def create_post(post:PostBase,
                current_user: User = Depends(get_current_user),
                db:Session = Depends(get_db)):
    # extractTextFromImage()
    created_post = posts.create_post(post=post,db=db)
    # Rename image file to use post ID if URL points to a file in /dest
    if created_post.url and created_post.url.startswith("/dest/"):
        posts.rename_image_to_post_id(created_post.url, created_post.id, db=db)
    return created_post

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

@router.post("/upload_image")
async def upload_image(
    file: UploadFile = File(...),
    post_id: Optional[UUID] = Query(None, description="Optional post ID to name the file")
):
    return await posts.upload_image(file=file, post_id=post_id)

@router.post("/upload_image_post")
async def upload_image_and_create_post(
    file: UploadFile = File(...),
    title: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload an image, extract text from it using OCR, and create a post.
    The post will have:
    - Extracted text as content
    - Post ID as the URL (e.g., /dest/{post_id}.jpg)
    """
    return await posts.upload_image_and_create_post(
        file=file,
        user_id=current_user.id,
        title=title,
        db=db
    )