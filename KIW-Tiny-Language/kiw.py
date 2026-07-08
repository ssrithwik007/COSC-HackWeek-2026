import sys
from pathlib import Path

from kiwti import KIWTI
from errors import KIWError

def run_file(filename: str):
    path = Path(filename)

    if not path.exists():
        print(f"Error: '{filename}' not found.")
        return

    interpreter = KIWTI()

    try:
        with open(path, "r", encoding="utf-8") as f:
            source = f.read()

        output = interpreter.run(source)

        if output:
            print(output)

    except KIWError as e:
        print(e)

    except Exception:
        print("Internal Interpreter Error")


def repl():
    interpreter = KIWTI()

    print("KIW Tiny Language v1.0")
    print("Type 'help' for commands.")
    print()

    buffer = []
    depth = 0

    while True:

        prompt = "... " if depth else "kiw> "

        try:
            line = input(prompt)
        except (EOFError, KeyboardInterrupt):
            print()
            break

        command = line.strip()

        # Only process commands when we're not inside a block
        if depth == 0:

            if command == "exit":
                break

            if command == "help":
                print("""
Commands
--------
help      Show this message
vars      Show variables
clear     Clear variables
exit      Exit the REPL
""")
                continue

            if command == "vars":
                print(interpreter.variables)
                continue

            if command == "clear":
                interpreter.variables.clear()
                print("Variables cleared.")
                continue

        buffer.append(line)

        if command.startswith(("check", "repeat")):
            depth += 1

        elif command == "end":
            depth -= 1

        if depth > 0:
            continue

        source = "\n".join(buffer)

        try:
            output = interpreter.run(source)

            if output:
                print(output)

        except KIWError as e:
            print(e)

        except Exception:
            print("Internal Interpreter Error")

        buffer.clear()


def main():

    if len(sys.argv) == 1:
        repl()

    elif len(sys.argv) == 2:
        run_file(sys.argv[1])

    else:
        print("Usage:")
        print("  python kiw.py")
        print("  python kiw.py <program.kiw>")


if __name__ == "__main__":
    main()