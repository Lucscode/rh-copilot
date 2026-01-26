import streamlit as st

st.set_page_config(page_title="RH Copilot", layout="wide")

st.title("🤖 RH Copilot")
st.write("Plataforma inteligente para Recursos Humanos")

st.divider()

col1, col2, col3 = st.columns(3)

with col1:
	st.page_link("pages/1_RH_Dashboard.py", label="Sou do RH", icon="👩‍💼")

with col2:
	st.page_link("pages/4_Chat_RH.py", label="Sou Funcionário", icon="💬")

with col3:
	st.page_link("pages/3_Enviar_Curriculo.py", label="Sou Candidato", icon="📄")
