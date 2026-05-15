"""Local dev only — runs api/chat.py as a standalone HTTP server on port 3001.

Usage:
  python run_api.py

Vite proxies /api → http://localhost:3001, so npm run dev + this script
together give you the full stack locally on Windows.
"""
import os
import sys
from http.server import HTTPServer

# Load .env.local so GEMINI_API_KEY and RSVP_CODE are available
_env_path = os.path.join(os.path.dirname(__file__), ".env.local")
if os.path.exists(_env_path):
    with open(_env_path, encoding="utf-8") as _f:
        for _line in _f:
            _line = _line.strip()
            if _line and not _line.startswith("#") and "=" in _line:
                _k, _, _v = _line.partition("=")
                os.environ.setdefault(_k.strip(), _v.strip())

sys.path.insert(0, os.path.dirname(__file__))
from api.chat import handler  # noqa: E402

PORT = int(os.environ.get("API_PORT", 3001))
print(f"API server @ http://localhost:{PORT}/api/chat  (Ctrl-C to stop)")
HTTPServer(("127.0.0.1", PORT), handler).serve_forever()
