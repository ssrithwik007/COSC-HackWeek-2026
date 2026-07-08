# KIW Tiny Language

**KIW (KIW Tiny Language)** is a lightweight interpreted programming language built entirely in Python. It features a simple, beginner-friendly syntax while supporting core programming concepts such as variables, expressions, conditional statements, loops, and console output.

Programs written in KIW use the **`.kiw`** file extension and are executed using the **KIWTI (KIW Tiny Interpreter)**.

---

## Features

* Custom programming language syntax
* Command-line interpreter
* Interactive REPL
* Streamlit-based web IDE
* Variables
* Numbers, strings, and booleans
* Arithmetic and comparison operators
* Variable reassignment
* Conditional statements
* Loops
* Single-line comments
* Custom runtime and syntax errors

---

## Project Structure

```text
kiw/
│
├── kiw.py                 # CLI & REPL
├── kiwti.py               # Interpreter
├── errors.py              # Custom error classes
├── app.py                 # Streamlit IDE
│
├── examples/
│   ├── hello.kiw
│   ├── factorial.kiw
│   ├── fibonacci.kiw
│   └── fizzbuzz.kiw
│
└── README.md
```

---

# Installation

Clone the repository.

```bash
git clone https://github.com/ssrithwik007/COSC-HackWeek-2026.git
cd COSC-HackWeek-2026/KIW-Tiny-Language
```

Create a virtual environment (optional).

```bash
python -m venv .venv
```

Activate it.

### Windows

```bash
.venv\Scripts\activate
```

### Linux / macOS

```bash
source .venv/bin/activate
```

Install Streamlit (required only for the web IDE).

```bash
pip install streamlit
```

---

# Running KIW

## Execute a KIW Program

```bash
python kiw.py examples/hello.kiw
```

Example:

```bash
python kiw.py examples/fizzbuzz.kiw
```

---

## Interactive REPL

Launch the interactive shell.

```bash
python kiw.py
```

Example session:

```text
KIW Tiny Language v1.0

kiw> new x = 10

kiw> say x
10

kiw> x = x + 5

kiw> say x
15

kiw> exit
```

---

## Streamlit IDE

Launch the graphical editor.

```bash
streamlit run app.py
```

---

# Language Syntax

---

## Comments

```kiw
^^ This is a comment
```

---

## Variables

Variables are declared using the `new` keyword.

```kiw
new age = 20
new name = "Alice"
new active = true
```

Variables cannot be redeclared.

```kiw
new x = 10
new x = 20      ^^ Error
```

---

## Variable Assignment

Existing variables can be updated.

```kiw
new score = 50

score = score + 10

say score
```

---

## Output

Use `say` to print values.

```kiw
say "Hello, World!"

new x = 25

say x

say x + 5
```

---

## Data Types

### Numbers

```kiw
new a = 10
new b = 5.5
```

### Strings

```kiw
new name = "KIW"
```

### Booleans

```kiw
new admin = true
new running = false
```

---

## Operators

### Arithmetic

```text
+
-
*
/
%
```

Example

```kiw
new x = 20

say x + 5

say x * 2
```

---

### Comparison

```text
==
!=
<
>
<=
>=
```

Example

```kiw
check age >= 18 =>
    say "Adult"
end
```

---

### Boolean

```text
and
or
not
```

Example

```kiw
check age >= 18 and verified == true =>
    say "Access Granted"
end
```

---

# Conditional Statements

```kiw
new age = 20

check age >= 18 =>
    say "Adult"
otherwise =>
    say "Minor"
end
```

Nested conditionals are supported.

---

# Loops

Repeat a block while the condition evaluates to `true`.

```kiw
new x = 5

repeat x > 0 =>
    say x
    x = x - 1
end
```

Nested loops are supported.

---

# Example Programs

## Hello World

```kiw
say "Hello, World!"
```

---

## Factorial

```kiw
new n = 5
new result = 1

repeat n > 1 =>
    result = result * n
    n = n - 1
end

say result
```

---

## FizzBuzz

```kiw
new i = 1

repeat i <= 100 =>

    check i % 15 == 0 =>
        say "FizzBuzz"
    otherwise =>
        check i % 3 == 0 =>
            say "Fizz"
        otherwise =>
            check i % 5 == 0 =>
                say "Buzz"
            otherwise =>
                say i
            end
        end
    end

    i = i + 1

end
```

---

# Error Handling

KIW provides descriptive custom errors.

* `KIWSyntaxError`
* `KIWRuntimeError`
* `KIWNameError`
* `KIWTypeError`
* `KIWBlockError`

Example:

```text
KIWNameError: Line 3: Undefined variable 'score'.
```

---

# Current Limitations

* No user-defined functions
* No lists or dictionaries
* No file I/O
* No modules or imports
* No classes

---

# Technologies Used

* Python 3
* Streamlit