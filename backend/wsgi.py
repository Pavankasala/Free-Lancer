import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from app import app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    # Use Waitress WSGI server for production on Windows/Cross-platform
    try:
        from waitress import serve
        print(f"🚀 Production Waitress WSGI Server running on http://0.0.0.0:{port}")
        serve(app, host='0.0.0.0', port=port)
    except ImportError:
        print(f"⚠️ Waitress not found, falling back to Flask development server on http://0.0.0.0:{port}")
        app.run(host='0.0.0.0', port=port)
