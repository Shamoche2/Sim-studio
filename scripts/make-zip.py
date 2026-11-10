"""Build sim-studio-offline.zip: everything a teacher needs to run Sim Studio with no internet.

Run after changing any simulation:  python3 scripts/make-zip.py
"""
import pathlib
import zipfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "sim-studio-offline.zip"
FILES = ["index.html", "catalog.js", "syllabus.js", "feedback.html", "thanks.html"]
FOLDERS = ["sims"]
GUIDE = """SIM STUDIO - OFFLINE VERSION
============================

1. Unzip this folder (right-click > Extract All on Windows; double-click on Mac).
2. Open the folder and double-click index.html.
3. It opens in your web browser. No internet is needed.

Tips
- Copy the folder to a USB stick to use it on any computer.
- Use "Full screen" to show a simulation on a projector.
- To share with students on the same Wi-Fi, see README in the online version:
  https://sim-stud.netlify.app/

Online version (always the latest): https://sim-stud.netlify.app/
"""


def main():
    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("sim-studio/HOW-TO-USE.txt", GUIDE)
        for name in FILES:
            z.write(ROOT / name, f"sim-studio/{name}")
        for folder in FOLDERS:
            for path in sorted((ROOT / folder).rglob("*")):
                if path.is_file():
                    z.write(path, f"sim-studio/{path.relative_to(ROOT).as_posix()}")
    print(f"Wrote {OUT.name} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
