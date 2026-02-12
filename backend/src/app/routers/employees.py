from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User
from app.core.auth import get_current_user

router = APIRouter()


@router.get("/me/dashboard")
def get_employee_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Dashboard do funcionário com informações básicas"""
    return {
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "role": current_user.role
        },
        "hours_worked": 0,
        "vacation_days": 0,
        "pending_requests": 0,
        "goals_progress": 0
    }


@router.get("/me/profile")
def get_employee_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Perfil completo do funcionário"""
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "department": "Departamento",
        "position": "Cargo",
        "hire_date": None,
        "phone": None,
        "address": None
    }


@router.get("/me/timesheet")
def get_employee_timesheet(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Registros de ponto do funcionário"""
    return {
        "records": [],
        "total_hours_month": 0,
        "expected_hours_month": 160
    }


@router.get("/me/goals")
def get_employee_goals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Metas e objetivos do funcionário"""
    return {
        "goals": [],
        "overall_progress": 0
    }


@router.get("/me/documents")
def get_employee_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Documentos do funcionário"""
    return {
        "documents": []
    }
