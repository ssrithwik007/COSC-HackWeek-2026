import json
from itertools import cycle
from pathlib import Path

folder_path = Path("Sound Board/sounds")

colors = ["bg-red", "bg-orange", "bg-blue", "bg-green"]
color_cycler = cycle(colors)

sounds = []
for item in folder_path.rglob("*"):
    if item.is_file():
        clean_name = item.stem.replace("-", " ").title()
        file_name = item.name

        sounds.append(
            {
                "name": clean_name,
                "file": file_name,
                "color": next(color_cycler),
            }
        )

js_array_string = f"const sounds = {json.dumps(sounds, indent=4)};"

print(js_array_string)
