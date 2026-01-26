import streamlit as st
import requests
from config import API_URL

st.title("💬 Chatbot de RH")

# Usuário fixo de demo
USER_ID = "demo-user"

if "messages" not in st.session_state:
	st.session_state.messages = []

for msg in st.session_state.messages:
	with st.chat_message(msg["role"]):
		st.write(msg["content"])

question = st.chat_input("Digite sua pergunta...")

if question:
	st.session_state.messages.append({"role": "user", "content": question})

	resp = requests.post(f"{API_URL}/chat", json={
		"user_id": USER_ID,
		"question": question
	})

	answer = resp.json()["answer"]

	st.session_state.messages.append({"role": "assistant", "content": answer})
	st.rerun()
