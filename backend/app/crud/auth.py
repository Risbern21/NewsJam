from sqlalchemy.orm import Session

from app.core.security import create_access_token, verify_password
from app.models.users import User


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    """
    Authenticate a user by checking if email exists and password is correct.
    Returns None if email doesn't exist or password is incorrect.
    For security, we don't reveal which one failed.
    """
    # First, check if user with this email exists
    user = db.query(User).filter(User.email == email).first()
    
    # If user doesn't exist, return None
    if not user:
        return None
    
    # If user exists, verify the password
    if not verify_password(password, str(user.hashed_password)):
        return None
    
    # Both checks passed, return the user
    return user


def create_token_for_user(user: User) -> str:
    data = {"sub": str(user.email)}
    return create_access_token(data=data)