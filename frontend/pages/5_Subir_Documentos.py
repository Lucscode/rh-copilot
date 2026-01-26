import streamlit as st
import requests
from config import API_URL

st.title("📚 Subir documento de RH")

title = st.text_input("Título")
content = st.text_area("Conteúdo do documento")

if st.button("Salvar documento"):
    if title and content:
        resp = requests.post(f"{API_URL}/documents", json={
            "title": title,
            "content": content
        })
        if resp.status_code == 200:
            st.success("Documento salvo!")
        else:
            st.error("Erro ao salvar")
    else:
        st.warning("Preencha título e conteúdo")
