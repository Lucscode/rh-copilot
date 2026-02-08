from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User, UserRole
from app.schemas.auth import UserRegister, UserLogin, Token, UserOut
from app.core.auth import hash_password, verify_password, create_access_token, decode_access_token
from typing import Optional

router = APIRouter()


@router.post("/register", response_model=Token)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Registra um novo usuário (RH ou Candidato)"""
    
    # Verifica se email já existe
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já cadastrado"
        )
    
    # Valida role
    valid_roles = [UserRole.RH.value, UserRole.CANDIDATO.value]
    if user_data.role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role inválido. Use: {valid_roles}"
        )
    
    # Cria usuário
    password_hashed = hash_password(user_data.password)
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=password_hashed,
        role=UserRole(user_data.role)
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Cria token
    access_token = create_access_token(
        data={"sub": new_user.email, "role": new_user.role.value}
    )
    
    return Token(
        access_token=access_token,
        user=UserOut.model_validate(new_user)
    )


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Faz login e retorna token JWT"""
    
    # Busca usuário
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos"
        )
    
    # Verifica senha
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos"
        )
    
    # Cria token
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value}
    )
    
    return Token(
        access_token=access_token,
        user=UserOut.model_validate(user)
    )


@router.get("/me", response_model=UserOut)
def get_current_user_info(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Retorna informações do usuário logado"""
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token não fornecido"
        )
    
    token = authorization.replace("Bearer ", "")
    token_data = decode_access_token(token)
    
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado"
        )
    
    user = db.query(User).filter(User.email == token_data["sub"]).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado"
        )
    
    return UserOut.model_validate(user)
