#!/usr/bin/env python3
"""Servidor Python para a EDY-K Barbershop.

Serve os arquivos estáticos (HTML, CSS, JS e imagens) e expõe uma API JSON
opcional em /api/state para persistir o estado da aplicação em data/store.json.

Uso:
    python server.py                 # http://127.0.0.1:8000
    python server.py 3000            # porta personalizada
    python server.py 8000 --host 0.0.0.0   # expor na rede (use com token)

Segurança da API local:
    - Por padrão o servidor escuta apenas em 127.0.0.1 (loopback).
    - Defina EDYK_API_TOKEN para exigir o cabeçalho X-EDYK-Token em /api/state.
      O front-end envia esse token quando config.js define localApiToken.
    - O corpo enviado a /api/state é limitado a 2 MB e precisa ser um objeto
      JSON (não um array/valor simples).
"""

import json
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA_FILE = ROOT / "data" / "store.json"
API_TOKEN = os.environ.get("EDYK_API_TOKEN", "").strip()
MAX_BODY_BYTES = 2 * 1024 * 1024
TOKEN_HEADER = "X-EDYK-Token"


class EDYKHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def _json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(body)

    def end_headers(self):
        # Evita cache velho de HTML/CSS/JS durante o desenvolvimento.
        if self.path.split("?")[0].endswith((".html", ".css", ".js", ".webmanifest")):
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def _token_ok(self):
        if not API_TOKEN:
            return True
        return self.headers.get(TOKEN_HEADER, "") == API_TOKEN

    def _unauthorized(self):
        self._json(401, {"error": "Token da API local ausente ou inválido"})

    def do_GET(self):
        path = self.path.split("?")[0]
        if path in ("/health", "/api/health", "/health/", "/api/health/"):
            self._json(200, {"status": "ok", "app": "EDY-K Barbershop"})
            return
        if path in ("/api/state", "/api/state/"):
            if not self._token_ok():
                self._unauthorized()
                return
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
        if not self._token_ok():
            self._unauthorized()
            return
        try:
            length = int(self.headers.get("Content-Length", 0))
        except (TypeError, ValueError):
            self._json(400, {"error": "Content-Length inválido"})
            return
        if length <= 0 or length > MAX_BODY_BYTES:
            self._json(413, {"error": "Corpo da requisição inválido ou muito grande"})
            return
        try:
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            self._json(400, {"error": "JSON inválido"})
            return
        if not isinstance(payload, dict):
            self._json(400, {"error": "O estado deve ser um objeto JSON"})
            return
        try:
            DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
            with DATA_FILE.open("w", encoding="utf-8") as fh:
                json.dump(payload, fh, ensure_ascii=False, indent=2)
            self._json(200, {"saved": True})
        except OSError as exc:
            self._json(500, {"error": str(exc)})

    def log_message(self, fmt, *args):
        # Log enxuto, sem poluir o terminal com requisições de assets.
        # fmt % args aceita HTTPStatus (ex.: 404), ao contrário de str(args[0]).
        message = fmt % args
        if "/api/" in message or "/health" in message:
            super().log_message(fmt, *args)


def main():
    args = sys.argv[1:]
    port = int(args[0]) if args and args[0].isdigit() else int(os.environ.get("PORT", 8000))
    host = "127.0.0.1"
    if "--host" in args:
        idx = args.index("--host")
        if idx + 1 < len(args):
            host = args[idx + 1]
    server = ThreadingHTTPServer((host, port), EDYKHandler)
    print(f"EDY-K Barbershop rodando em http://{host}:{port}")
    if API_TOKEN:
        print("API /api/state protegida por X-EDYK-Token.")
    elif host != "127.0.0.1":
        print("AVISO: API /api/state sem autenticação e exposta na rede. Defina EDYK_API_TOKEN.")
    print("Pressione Ctrl+C para encerrar.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor encerrado.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
