"""
Utilitários de autenticação: hash de senha e JWT simples (MVP)
Para produção: usar passlib[bcrypt] e python-jose[cryptography]
"""
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta
from typing import Optional

# Secret key para JWT (em produção usar variável de ambiente)
SECRET_KEY = "rh-copilot-secret-key-mvp-2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 dias


def hash_password(password: str) -> str:
    """Hash simples de senha usando SHA256 (MVP)"""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se a senha corresponde ao hash"""
    return hash_password(plain_password) == hashed_password


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Cria um token JWT simples (MVP)
    Para produção: usar python-jose
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire.isoformat()})
    
    # Token simples: base64(email:role:exp:signature)
    payload = f"{to_encode.get('sub')}:{to_encode.get('role')}:{to_encode['exp']}"
    signature = hmac.new(
        SECRET_KEY.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()[:16]
    
    token = f"{payload}:{signature}"
    return token


def decode_access_token(token: str) -> Optional[dict]:
    """
    Decodifica e valida o token
    Retorna dict com 'sub' (email) e 'role', ou None se inválido
    """
    try:
        parts = token.split(":")
        if len(parts) != 4:
            return None
        
        email, role, exp_str, signature = parts
        
        # Verifica assinatura
        payload = f"{email}:{role}:{exp_str}"
        expected_signature = hmac.new(
            SECRET_KEY.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()[:16]
        
        if signature != expected_signature:
            return None
        
        # Verifica expiração
        exp = datetime.fromisoformat(exp_str)
        if datetime.utcnow() > exp:
            return None
        
        return {"sub": email, "role": role}
    
    except Exception:
        return None
