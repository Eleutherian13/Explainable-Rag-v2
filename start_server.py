#!/usr/bin/env python
"""
Robust backend server with auto-restart on failure.
"""
import sys
import os
import time
import subprocess

def start_backend():
    """Start the backend server."""
    print("\n" + "="*60)
    print("Starting Dataforge Backend Server...")
    print("="*60)
    print(f"Time: {time.strftime('%H:%M:%S')}")
    print(f"Listening on: http://127.0.0.1:8000")
    print(f"API Docs: http://127.0.0.1:8000/docs")
    print("="*60 + "\n")
    
    # Add backend to path
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
    
    import uvicorn
    from app.main import app
    
    try:
        uvicorn.run(
            app,
            host="127.0.0.1",
            port=8000,
            log_level="info",
            access_log=True
        )
    except KeyboardInterrupt:
        print("\n\nShutting down backend...")
    except Exception as e:
        print(f"ERROR: {e}")
        print("Retrying in 5 seconds...")
        time.sleep(5)
        start_backend()

if __name__ == "__main__":
    start_backend()
