#!/usr/bin/env python3
"""Dev server with Cache-Control: no-store headers so ES modules are never cached."""
import http.server, functools

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        super().end_headers()

    def log_message(self, fmt, *args):
        pass  # silence request logs

if __name__ == '__main__':
    http.server.test(HandlerClass=NoCacheHandler, port=8080, bind='')
