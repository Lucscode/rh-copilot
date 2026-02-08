from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pathlib import Path
import uuid
from app.db.session import get_db
from app.db.models import Candidate

router = APIRouter()

# Storage path
CV_STORAGE_DIR = Path(__file__).resolve().parents[3] / "cv_storage"
CV_STORAGE_DIR.mkdir(exist_ok=True)


@router.post("/upload/{candidate_id}")
async def upload_cv(candidate_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload CV para um candidato (PDF, DOC, DOCX)"""
    
    # Validate file type
    allowed_extensions = {".pdf", ".doc", ".docx", ".txt"}
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"Arquivo inválido. Formatos aceitos: {', '.join(allowed_extensions)}")
    
    # Get candidate
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidato não encontrado")
    
    # Generate unique filename
    unique_filename = f"{candidate_id}_{uuid.uuid4().hex}{file_ext}"
    file_path = CV_STORAGE_DIR / unique_filename
    
    # Save file
    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)
    
    # Update candidate cv_url
    candidate.cv_url = unique_filename
    db.commit()
    db.refresh(candidate)
    
    return {
        "id": candidate.id,
        "name": candidate.name,
        "cv_url": candidate.cv_url,
        "message": "CV salvo com sucesso!"
    }


@router.get("/download/{candidate_id}")
async def download_cv(candidate_id: str, db: Session = Depends(get_db)):
    """Download CV de um candidato"""
    
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate or not candidate.cv_url:
        raise HTTPException(status_code=404, detail="CV não encontrado")
    
    file_path = CV_STORAGE_DIR / candidate.cv_url
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Arquivo não encontrado no servidor")
    
    return FileResponse(
        path=file_path,
        filename=f"{candidate.name}_CV{file_path.suffix}",
        media_type="application/octet-stream"
    )


@router.delete("/{candidate_id}")
async def delete_cv(candidate_id: str, db: Session = Depends(get_db)):
    """Deletar CV de um candidato"""
    
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidato não encontrado")
    
    if candidate.cv_url:
        file_path = CV_STORAGE_DIR / candidate.cv_url
        if file_path.exists():
            file_path.unlink()
        candidate.cv_url = None
        db.commit()
    
    return {"message": "CV deletado com sucesso"}
