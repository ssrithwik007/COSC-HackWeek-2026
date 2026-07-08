import streamlit as st
from streamlit_ace import st_ace
from pathlib import Path

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
    st.header("Examples")

    examples_dir = Path("examples")

    examples = {}

    if examples_dir.exists():
        for file in examples_dir.glob("*.kiw"):
            examples[file.stem] = file

    selected = st.selectbox(
        "Load Example",
        ["None"] + list(examples.keys())
    )

    if st.button("Load Example"):

        if selected != "None":
            st.session_state.code = examples[selected].read_text(
                encoding="utf-8"
            )

    st.divider()

    st.header("Syntax")

    st.code("""
new x = 5

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
""", language="text")
    
run_col, clear_col, download_col, empty = st.columns([1, 1, 1, 6])

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
        st.session_state.code,
        file_name="program.kiw",
        mime="text/plain",
        use_container_width=True
    )

left, right = st.columns([1, 1])

with left:

    st.subheader("Editor")
    code = st_ace(
        value=st.session_state.code,
        language="python",
        theme="tomorrow_night_eighties",
        height=500,
        auto_update=True,
        wrap=True
    )

    st.session_state.code = code

with right:

    st.subheader("Console")

    if st.session_state.output:
        st.code(
            st.session_state.output,
            language="text", 
            height=500,
            line_numbers=True
        )

if run:

    interpreter = KIWTI()

    try:

        output = interpreter.run(
            st.session_state.code
        )

        st.session_state.output = output

        st.rerun()

    except KIWError as e:

        st.error(str(e))

    except Exception as e:

        st.exception(e)

st.divider()

st.caption(
    "KIW Tiny Language • KIWTI Interpreter • Version 1.0"
)