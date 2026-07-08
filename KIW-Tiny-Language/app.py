import streamlit as st

from kiwti import KIWTI
from errors import KIWError

st.set_page_config(
    page_title="KIW Tiny Language",
    page_icon="🥝",
    layout="wide"
)

st.title("🥝 KIW Tiny Language")
st.caption("Write KIW code, run it instantly, and experiment with the language.")

if "code" not in st.session_state:
    st.session_state.code = ""

if "output" not in st.session_state:
    st.session_state.output = ""

with st.sidebar:
    st.header("Load Program")

    uploaded_file = st.file_uploader(
        "Choose a .kiw file",
        type=["kiw"]
    )

    if uploaded_file is not None:
        st.session_state.code = uploaded_file.read().decode("utf-8")

    st.divider()

    st.header("Syntax")

    st.code(
"""new x = 5

say x

check x > 5 =>
    say "Big"
otherwise =>
    say "Small"
end

repeat x > 0 =>
    say x
    x = x - 1
end
""",
        language="text"
    )

run_col, clear_col, download_col, _ = st.columns([1, 1, 1, 6])

with run_col:
    run = st.button("Run", use_container_width=True)

with clear_col:
    if st.button("Clear", use_container_width=True):
        st.session_state.code = ""
        st.session_state.output = ""
        st.rerun()

with download_col:
    st.download_button(
        "Download",
        data=st.session_state.code,
        file_name="program.kiw",
        mime="text/plain",
        use_container_width=True
    )

left, right = st.columns(2)

with left:
    st.subheader("Editor")

    st.session_state.code = st.text_area(
        "KIW Code",
        value=st.session_state.code,
        height=500,
        label_visibility="collapsed"
    )

with right:
    st.subheader("Console")

    st.code(
        st.session_state.output,
        language="text",
        line_numbers=True,
        wrap_lines=True,
        height=500
    )

if run:
    interpreter = KIWTI()

    try:
        st.session_state.output = interpreter.run(st.session_state.code)

    except KIWError as e:
        st.session_state.output = str(e)

    except Exception as e:
        st.session_state.output = str(e)

    st.rerun()

st.divider()

st.caption("KIW Tiny Language • KIWTI Interpreter • Version 1.0")