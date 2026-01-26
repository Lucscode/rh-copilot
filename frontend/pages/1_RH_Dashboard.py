import streamlit as st
import requests
from config import API_URL

st.title("👩‍💼 Dashboard do RH")

# Listar vagas
resp = requests.get(f"{API_URL}/jobs")
jobs = resp.json()

st.subheader("Vagas cadastradas")

if not jobs:
	st.info("Nenhuma vaga cadastrada ainda.")
else:
	for job in jobs:
		col1, col2 = st.columns([3,1])
		col1.write(f"**{job['title']}**")
		if col2.button("Ver candidatos", key=job["id"]):
			st.session_state["job_id"] = job["id"]
			st.switch_page("pages/2_Criar_Vaga.py")

st.divider()
if st.button("➕ Criar nova vaga"):
	st.switch_page("pages/2_Criar_Vaga.py")

st.divider()

if st.button("🔥 Popular dados de demo"):
	try:
		r = requests.post(f"{API_URL}/seed/")
		if r.status_code == 200:
			st.success("Dados de demo populados com sucesso.")
			st.experimental_rerun()
		else:
			st.error(f"Falha ao popular demo: {r.status_code} {r.text}")
	except Exception as e:
		st.error(f"Erro ao chamar /api/seed: {e}")
