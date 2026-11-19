#!/usr/bin/env python3
"""Servidor Python para a EDY-K Barbershop.

Serve os arquivos estáticos (HTML, CSS, JS e imagens) e expõe uma API JSON
opcional em /api/state para persistir o estado da aplicação em data/store.json.

Uso:
    python server.py            # http://localhost:8000
    python server.py 3000       # porta personalizada
"""

import json
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA_FILE = ROOT / "data" / "store.json"


class EDYKHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def _json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def end_headers(self):
        # Evita cache velho de HTML/CSS/JS durante o desenvolvimento.
        if self.path.split("?")[0].endswith((".html", ".css", ".js", ".webmanifest")):
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def do_GET(self):
        path = self.path.split("?")[0]
        if path == "/api/health":
            self._json(200, {"status": "ok", "app": "EDY-K Barbershop"})
            return
        if path in ("/api/state", "/api/state/"):
            if not DATA_FILE.exists():
                self._json(200, {})
                return
            try:
                with DATA_FILE.open("r", encoding="utf-8") as fh:
                    self._json(200, json.load(fh))
            except (OSError, json.JSONDecodeError):
                self._json(200, {})
            return
        super().do_GET()

    def do_POST(self):
        path = self.path.split("?")[0]
        if path not in ("/api/state", "/api/state/"):
            self._json(404, {"error": "Endpoint não encontrado"})
            return
        try:
            length = int(self.headers.get("Content-Length", 0))
            payload = json.loads(self.rfile.read(length).decode("utf-8") or "{}")
            DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
            with DATA_FILE.open("w", encoding="utf-8") as fh:
                json.dump(payload, fh, ensure_ascii=False, indent=2)
            self._json(200, {"saved": True})
        except (ValueError, OSError) as exc:
            self._json(400, {"error": str(exc)})

    def log_message(self, fmt, *args):
        # Log enxuto, sem poluir o terminal com requisições de assets.
        if "/api/" in (args[0] if args else ""):
            super().log_message(fmt, *args)


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.environ.get("PORT", 8000))
    server = ThreadingHTTPServer(("0.0.0.0", port), EDYKHandler)
    print(f"EDY-K Barbershop rodando em http://localhost:{port}")
    print("Pressione Ctrl+C para encerrar.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor encerrado.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
