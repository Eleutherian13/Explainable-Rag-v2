#!/usr/bin/env python3
"""Test backend upload and query endpoints."""
import requests
import json
import time
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_upload():
    """Test file upload endpoint."""
    print("[TEST] Uploading test file...")
    
    with open("test_upload.txt", "rb") as f:
        files = {"files": ("test_upload.txt", f)}
        try:
            resp = requests.post(f"{BASE_URL}/upload", files=files, timeout=30)
            print(f"[TEST] Upload response code: {resp.status_code}")
            
            if resp.status_code == 200:
                data = resp.json()
                print(f"[TEST] Upload SUCCESS: {json.dumps(data, indent=2)}")
                return data.get("index_id")
            else:
                print(f"[TEST] Upload FAILED: {resp.text}")
                return None
        except Exception as e:
            print(f"[TEST] Upload ERROR: {e}")
            return None

def test_query(index_id):
    """Test query endpoint."""
    print(f"\n[TEST] Querying with index_id: {index_id}")
    
    query_data = {
        "query": "Who works at Google?",
        "index_id": index_id,
        "top_k": 5
    }
    
    try:
        resp = requests.post(f"{BASE_URL}/query", json=query_data, timeout=30)
        print(f"[TEST] Query response code: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            print(f"[TEST] Query SUCCESS:")
            print(f"  Answer: {data.get('answer')[:200]}...")
            print(f"  Entities: {len(data.get('entities', []))} found")
            print(f"  Confidence: {data.get('confidence_score'):.2%}")
            return True
        else:
            print(f"[TEST] Query FAILED: {resp.text}")
            return False
    except Exception as e:
        print(f"[TEST] Query ERROR: {e}")
        return False

if __name__ == "__main__":
    print("[TEST] Starting backend tests...\n")
    
    # Test upload
    index_id = test_upload()
    if not index_id:
        print("[TEST] Upload failed, cannot proceed to query test")
        sys.exit(1)
    
    # Wait for background processing
    time.sleep(2)
    
    # Test query
    success = test_query(index_id)
    
    if success:
        print("\n[TEST] All tests PASSED ✓")
    else:
        print("\n[TEST] Some tests FAILED ✗")
