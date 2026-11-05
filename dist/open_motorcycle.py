from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import threading
import webbrowser

root = Path(__file__).resolve().parent
if not (root / "motorcycle.html").is_file():
    raise SystemExit("motorcycle.html is missing. Extract the complete ZIP first.")
server = ThreadingHTTPServer(("127.0.0.1", 0), partial(SimpleHTTPRequestHandler, directory=str(root)))
url = f"http://127.0.0.1:{server.server_port}/motorcycle.html"
thread = threading.Thread(target=server.serve_forever, daemon=True)
thread.start()
print("Motorcycle viewer:", url, flush=True)
print("Keep this window open. Press Enter to stop.", flush=True)
webbrowser.open(url)
try:
    input()
except (KeyboardInterrupt, EOFError):
    pass
finally:
    server.shutdown()
    server.server_close()
