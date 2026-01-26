import streamlit as st
import requests
from config import API_URL

st.title("📄 Enviar Currículo")

name = st.text_input("Nome completo")
email = st.text_input("Email")
resume_text = st.text_area("Cole aqui o texto do currículo (PDF depois)")

# Buscar vagas
jobs = requests.get(f"{API_URL}/jobs").json()
job_titles = {job["title"]: job["id"] for job in jobs}

selected = st.selectbox("Selecione a vaga", list(job_titles.keys()))

if st.button("Enviar currículo"):
	if name and email and resume_text:
		# cria candidato
		cand_payload = {"name": name, "email": email, "resume_text": resume_text}
		cand_resp = requests.post(f"{API_URL}/candidates", json=cand_payload)
		cand = cand_resp.json()

		# cria application
		app_payload = {
			"job_id": job_titles[selected],
			"candidate_id": cand["id"]
		}
		app_resp = requests.post(f"{API_URL}/applications", json=app_payload)

		if app_resp.status_code == 200:
			st.success("Currículo enviado com sucesso!")
		else:
			st.error("Erro ao processar candidatura")
	else:
		st.warning("Preencha todos os campos")
