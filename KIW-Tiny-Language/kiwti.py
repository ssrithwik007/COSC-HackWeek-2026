import re
from errors import KIWBlockError, KIWError, KIWNameError, KIWRuntimeError, KIWSyntaxError, KIWTypeError

class KIWTI:
    def __init__(self):
        self.variables = {}
        self.output = []
        self.safe_globals = { 
            "__builtins__": {},
            "len": len,
            "int": int,
            "float": float,
            "str": str,
            "bool": bool,
            "ask": input,
        }
    
    def find_end(self, lines: list[str], start: int) -> int:
        depth = 1
        index = start + 1

        while index < len(lines):
            line = lines[index].strip()
            if line.startswith(("check", "repeat")):
                depth += 1
            elif line.startswith("end"):
                depth -= 1
            if depth == 0:
                break
            index += 1

        if index >= len(lines):
            raise KIWBlockError(f"Line {start+1}: Missing 'end'.")
        
        return index
    
    def find_otherwise(self, lines: list[str], start: int, end: int) -> int | None:
        index = start + 1
        depth = 1

        while index < end:
            line = lines[index].strip()
            if line.startswith(("check", "repeat")):
                depth += 1
            elif line.startswith("end"):
                depth -= 1
            if line.startswith("otherwise") and depth == 1:
                return index
            index += 1

        return None

    def extract_condition(self, line: str) -> str:
        return line.split("=>", 1)[0].split(maxsplit=1)[1].strip()

    def evaluate(self, expr: str, line: int) -> any:
        expr = re.sub(r"\btrue\b", "True", expr)
        expr = re.sub(r"\bfalse\b", "False", expr)
        try:
            return eval(expr, self.safe_globals, self.variables)

        except NameError as e:
            raise KIWNameError(f"Line {line}: {e}")

        except ZeroDivisionError:
            raise KIWRuntimeError(f"Line {line}: Division by zero.")

        except TypeError as e:
            raise KIWTypeError(f"Line {line}: {e}")

        except SyntaxError:
            raise KIWSyntaxError(f"Line {line}: Invalid expression.")

        except Exception as e:
            raise KIWRuntimeError(f"Line {line}: {e}")
        
    def evaluate_condition(self, expr: str, line: int) -> bool:
        result = self.evaluate(expr, line)

        if not isinstance(result, bool):
            raise KIWTypeError(f"Line {line}: Condition must evaluate to boolean")
        
        return result

    def execute_block(self, lines: list[str]) -> None:
        i = 0
        while i < len(lines):
            i = self.execute_line(lines, i)

    def run(self, source: str) -> str:
        self.output = []
        lines = [
                    line.strip()
                    for line in source.splitlines()
                    if line.strip() and not line.strip().startswith("^^")
                ]
        self.execute_block(lines)

        return "\n".join(self.output)

    def execute_line(self, lines: list[str], index: int) -> int:
        line = lines[index].strip()
        if line.startswith("new"):
            self.handle_new(line, index)
            return index + 1
        elif line.startswith("say"):
            self.handle_say(line, index)
            return index + 1
        elif line.startswith("check"):
            return self.handle_check(lines, index)
        elif line.startswith("repeat"):
            return self.handle_repeat(lines, index)
        elif line == "end":
            return index + 1
        elif line.startswith("otherwise"):
            return index + 1
        elif "=" in line:
            self.eval_expr(line, index)
            return index + 1
        else:
            raise KIWSyntaxError(f"Line {index+1}: Unknown statement '{line}'.")


    def eval_expr(self, line: str, line_number: int) -> None:
        name, expr = line.split("=", 1)
        name = name.strip()
        expr = expr.strip()

        if name not in self.variables:
            raise KIWNameError(f"Line {line_number + 1}: Variable '{name}' is not declared. Use 'new {name} = ...' first.")

        self.variables[name] = self.evaluate(expr, line_number + 1)

    def handle_new(self, line: str, line_number: int) -> None:
        statement = line[4:]

        if "=" not in statement:
            raise KIWSyntaxError(
                f"Line {line_number + 1}: Expected '=' after variable name."
            )

        name, expr = statement.split("=", 1)

        name = name.strip()
        expr = expr.strip()

        if not name.isidentifier():
            raise KIWSyntaxError(f"Line {line_number + 1}: Invalid variable name '{name}'.")

        if name in self.variables:
            raise KIWNameError(f"Line {line_number + 1}: Variable '{name}' already exists.")

        self.variables[name] = self.evaluate(expr, line_number + 1)

    def handle_say(self, line: str, line_number: int) -> None:
        content = str(self.evaluate(line.split("say", 1)[1], line_number+1))
        self.output.append(content)

    def handle_check(self, lines: list[str], index: int) -> int:
        start = index
        end = self.find_end(lines, start)
        otherwise = self.find_otherwise(lines, start, end)
        condition = self.extract_condition(lines[start])
        if otherwise is None:
            if_body = lines[start+1:end]
            else_body = []
        else:
            if_body = lines[start+1:otherwise]
            else_body = lines[otherwise+1:end]
        if self.evaluate_condition(condition, index+1):
            self.execute_block(if_body)
        else:
            self.execute_block(else_body)
        
        return end+1
        
    def handle_repeat(self, lines: list[str], index: int) -> int:
        start = index
        end = self.find_end(lines, start)
        body = lines[start+1:end]
        condition = self.extract_condition(lines[index])
        while self.evaluate_condition(condition, line=index+1):
            self.execute_block(body)

        return end + 1