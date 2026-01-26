import streamlit as st
import requests
from config import API_URL

st.title("✍️ Criar nova vaga")

title = st.text_input("Título da vaga")
short_desc = st.text_area("Descrição curta")

if st.button("Gerar descrição com IA"):
	if title and short_desc:
		payload = {"title": title, "short_description": short_desc}
		resp = requests.post(f"{API_URL}/jobs", json=payload)
		if resp.status_code == 200:
			job = resp.json()
			st.success("Vaga criada com sucesso!")
			st.subheader("Descrição completa gerada:")
			st.write(job["full_description"])
		else:
			st.error("Erro ao criar vaga")
	else:
		st.warning("Preencha todos os campos")

st.divider()

# Se veio do dashboard para ver candidatos
job_id = st.session_state.get("job_id")

if job_id:
	st.subheader("📄 Candidatos da vaga")

	resp = requests.get(f"{API_URL}/applications/by-job/{job_id}")
	apps = resp.json()

	if not apps:
		st.info("Nenhum candidato ainda.")
	else:
		for app in apps:
			st.write(f"**Score:** {app['match_score']*100:.1f}%")
			st.write(f"Resumo: {app['summary']}")
			st.divider()
