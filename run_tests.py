#!/usr/bin/env python3
"""Integrated test script that starts backend and tests it."""
import subprocess
import time
import requests
import json
import sys
import os
from pathlib import Path

BASE_URL = "http://127.0.0.1:8000"

def wait_for_server(timeout=15):
    """Wait for backend server to be ready."""
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            resp = requests.get(f"{BASE_URL}/status", timeout=2)
            if resp.status_code == 200:
                print("[✓] Backend server is ready")
                return True
        except:
            pass
        time.sleep(0.5)
    print("[✗] Backend server failed to start")
    return False

def test_upload():
    """Test file upload endpoint."""
    print("\n[TEST] Uploading test file...")
    
    test_file = Path("test_upload.txt")
    if not test_file.exists():
        print(f"[✗] Test file not found: {test_file}")
        return None
    
    with open(test_file, "rb") as f:
        files = {"files": ("test_upload.txt", f)}
        try:
            resp = requests.post(f"{BASE_URL}/upload", files=files, timeout=30)
            print(f"[•] Upload response code: {resp.status_code}")
            
            if resp.status_code == 200:
                data = resp.json()
                print(f"[✓] Upload SUCCESS")
                print(f"    - Index ID: {data.get('index_id')[:8]}...")
                print(f"    - Chunks: {data.get('chunks_count')}")
                return data.get("index_id")
            else:
                print(f"[✗] Upload FAILED: {resp.text[:200]}")
                return None
        except Exception as e:
            print(f"[✗] Upload ERROR: {e}")
            return None

def test_query(index_id):
    """Test query endpoint."""
    print(f"\n[TEST] Querying database...")
    
    query_data = {
        "query": "Who works at Google?",
        "index_id": index_id,
        "top_k": 5
    }
    
    try:
        resp = requests.post(f"{BASE_URL}/query", json=query_data, timeout=30)
        print(f"[•] Query response code: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            print(f"[✓] Query SUCCESS")
            answer = data.get('answer', '')
            print(f"    - Answer: {answer[:100]}...")
            print(f"    - Entities: {len(data.get('entities', []))} found")
            print(f"    - Confidence: {data.get('confidence_score', 0):.1%}")
            return True
        else:
            print(f"[✗] Query FAILED: {resp.text[:200]}")
            return False
    except Exception as e:
        print(f"[✗] Query ERROR: {e}")
        return False

if __name__ == "__main__":
    print("="*60)
    print("DATAFORGE BACKEND TEST SUITE")
    print("="*60)
    
    # Start backend
    print("\n[•] Starting backend server...")
    backend_proc = subprocess.Popen(
        [sys.executable, "run_backend.py"],
        cwd=os.getcwd(),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    
    time.sleep(1)
    
    # Wait for server
    if not wait_for_server():
        backend_proc.terminate()
        sys.exit(1)
    
    try:
        # Test upload
        index_id = test_upload()
        if not index_id:
            print("\n[✗] Tests FAILED at upload stage")
            sys.exit(1)
        
        # Wait for background processing
        print("\n[•] Waiting for background processing...")
        time.sleep(3)
        
        # Test query
        if test_query(index_id):
            print("\n" + "="*60)
            print("[✓] ALL TESTS PASSED - BACKEND IS FUNCTIONAL")
            print("="*60)
        else:
            print("\n[✗] Tests FAILED at query stage")
            sys.exit(1)
    finally:
        # Stop backend
        backend_proc.terminate()
        backend_proc.wait(timeout=5)
