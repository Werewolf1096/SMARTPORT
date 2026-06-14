from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
import argparse
import os


ROOT = Path(__file__).resolve().parent
FUTURE_BLOG_ARTICLES = {
    "/blog/kolik-stoji-loxone",
    "/blog/loxone-a-fotovoltaika",
    "/blog/zabezpeceni-s-loxone",
}


class SmartportHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        self._handle_request()

    def do_HEAD(self):
        self._handle_request(head_only=True)

    def _handle_request(self, head_only=False):
        parsed = urlsplit(self.path)
        path = parsed.path

        if path in FUTURE_BLOG_ARTICLES:
            self.send_response(302)
            self.send_header("Location", "/blog")
            self.end_headers()
            return

        if path.endswith(".html"):
            target = path[:-5] or "/"
            if target == "/index":
                target = "/"
            if parsed.query:
                target = f"{target}?{parsed.query}"
            self.send_response(301)
            self.send_header("Location", target)
            self.end_headers()
            return

        if path != "/" and path.endswith("/"):
            target = path.rstrip("/")
            if parsed.query:
                target = f"{target}?{parsed.query}"
            self.send_response(301)
            self.send_header("Location", target)
            self.end_headers()
            return

        super().do_HEAD() if head_only else super().do_GET()

    def translate_path(self, path):
        if urlsplit(path).path == "/blog":
            return str(ROOT / "blog.html")

        translated = Path(super().translate_path(path))
        if translated.exists() or translated.suffix:
            return str(translated)

        html_path = translated.with_suffix(".html")
        if html_path.exists():
            return str(html_path)

        return str(translated)

    def log_message(self, format, *args):
        print(f"{self.address_string()} - {format % args}")


def main():
    parser = argparse.ArgumentParser(description="Serve SMARTPORT locally with extensionless URL support.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", default=8000, type=int)
    args = parser.parse_args()

    os.chdir(ROOT)
    server = ThreadingHTTPServer((args.host, args.port), SmartportHandler)
    print(f"Serving {ROOT} at http://{args.host}:{args.port}/")
    server.serve_forever()


if __name__ == "__main__":
    main()
