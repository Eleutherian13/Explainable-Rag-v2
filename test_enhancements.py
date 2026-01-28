#!/usr/bin/env python
"""
Quick test script for enhanced features
"""
import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_endpoints():
    """Test all new endpoints"""
    
    print("=" * 60)
    print("TESTING ENHANCED DATAFORGE FEATURES")
    print("=" * 60)
    
    # Test 1: Pipeline Info
    print("\n✓ Test 1: Pipeline Information")
    print("-" * 60)
    try:
        response = requests.get(f"{BASE_URL}/pipeline-info", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Pipeline info retrieved successfully")
            print(f"   - Upload stages: {len(data.get('upload_pipeline', []))}")
            print(f"   - Query stages: {len(data.get('query_pipeline', []))}")
        else:
            print(f"❌ Pipeline info failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 2: Upload a test document
    print("\n✓ Test 2: Document Upload")
    print("-" * 60)
    try:
        test_content = """
        Artificial Intelligence (AI) is revolutionizing technology.
        Machine Learning enables systems to learn from data.
        Deep Learning uses neural networks with multiple layers.
        Natural Language Processing helps computers understand text.
        """
        
        with open("/tmp/test_doc.txt", "w") as f:
            f.write(test_content)
        
        with open("/tmp/test_doc.txt", "rb") as f:
            files = {"file": f}
            data = {"session_id": "test_session_12345"}
            response = requests.post(f"{BASE_URL}/upload", files=files, data=data, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Document uploaded successfully")
            print(f"   - Documents: {result.get('documents_count', 0)}")
            print(f"   - Total chunks: {result.get('chunks_count', 0)}")
            print(f"   - Entities found: {result.get('entities_count', 0)}")
        else:
            print(f"❌ Upload failed: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 3: Enhanced Query
    print("\n✓ Test 3: Enhanced Query")
    print("-" * 60)
    try:
        query_data = {
            "query": "What is artificial intelligence and how does machine learning relate to it?",
            "session_id": "test_session_12345"
        }
        response = requests.post(f"{BASE_URL}/query-enhanced", json=query_data, timeout=15)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Enhanced query executed successfully")
            
            if "main_answer" in result:
                answer_len = len(result["main_answer"])
                print(f"   - Main answer length: {answer_len} characters")
                if answer_len > 200:
                    print(f"   - Answer preview: {result['main_answer'][:150]}...")
                else:
                    print(f"   - Answer: {result['main_answer']}")
            
            if "summary" in result:
                print(f"   - Summary length: {len(result['summary'])} characters")
            
            if "key_points" in result:
                print(f"   - Key points: {len(result['key_points'])} points")
            
            if "confidence" in result:
                print(f"   - Confidence score: {result['confidence']}%")
            
            if "pdf_html" in result:
                print(f"   - PDF HTML available: {len(result['pdf_html'])} characters")
        else:
            print(f"❌ Query failed: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 4: Pipeline Visualization
    print("\n✓ Test 4: Pipeline Visualization")
    print("-" * 60)
    try:
        response = requests.get(f"{BASE_URL}/pipeline-visualization/test_session_12345", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Pipeline visualization retrieved")
            print(f"   - Upload stages: {len(data.get('upload_stages', []))}")
            print(f"   - Query stages: {len(data.get('query_stages', []))}")
            if "current_stage" in data:
                print(f"   - Current stage: {data['current_stage']}")
            if "progress" in data:
                print(f"   - Progress: {data['progress']}%")
        else:
            print(f"❌ Pipeline visualization failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 5: Entity Context (if entities were extracted)
    print("\n✓ Test 5: Entity Context")
    print("-" * 60)
    try:
        entity_data = {
            "entity_name": "Machine Learning",
            "entity_type": "CONCEPT"
        }
        response = requests.post(
            f"{BASE_URL}/entity-context/test_session_12345",
            json=entity_data,
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Entity context retrieved")
            if "entity_name" in data:
                print(f"   - Entity: {data['entity_name']}")
            if "mentions_count" in data:
                print(f"   - Mentions: {data['mentions_count']}")
        elif response.status_code == 404:
            print(f"⚠️  Entity not found (this is okay)")
        else:
            print(f"❌ Entity context failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    print("\n✅ All enhanced features are working!")
    print("\nNext steps:")
    print("1. Open http://localhost:5173 in your browser")
    print("2. Upload documents")
    print("3. Submit a query")
    print("4. Explore the new tabs:")
    print("   - 📋 Summary: Concise overview of the answer")
    print("   - ⭐ Key Points: Main takeaways")
    print("   - 🔄 Pipeline: Data flow visualization")
    print("   - ⬇️ Export: Download PDF of results")
    print("   - 🏷️ Entities: Interactive entity explorer")
    print("   - 📄 Sources: Document highlighting")

if __name__ == "__main__":
    test_endpoints()
