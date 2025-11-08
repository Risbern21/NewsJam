from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.crud import auth as crud_auth
from app.db.session import get_db
from app.models.users import User
from app.schemas.token import Token

router = APIRouter(prefix="/auth")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

unauthorized_error = "you do not have neccessary permissions"


# login endpoint for getting token for login
@router.post("/token", response_model=Token, tags=["auth"])
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = crud_auth.authenticate_user(
        db, form_data.username, form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You have entered an incorrect username or password.",
            headers={"WWW-headers": "Bearer"},
        )
    access_token = crud_auth.create_token_for_user(user)
    return {"access_token": access_token, "token_type": "bearer"}

# user exchanges token for his creds
def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    from jose import JWTError, jwt

    from app.core.security import ALGORITHM, SECRET_KEY

    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=unauthorized_error,
        headers={"WWW-headers": "Bearer"},
    )

    try:
        if SECRET_KEY is not None and ALGORITHM is not None:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_email = payload.get("sub")

            if user_email is None:
                raise credentials_error
            user = db.query(User).filter(User.email == str(user_email)).first()
            if user is not None:
                return user
            raise credentials_error
        raise Exception("unable to get env vars")

    except JWTError:
        raise credentials_error
    except Exception:
        raise