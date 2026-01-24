# Error Messages Reference Guide

## All Possible Error Scenarios & Solutions

### 1. File Validation Errors

#### ❌ "No files provided. Please select at least one file."
**When:** User clicks upload without selecting files
**UI:** Red alert, auto-hides after 6 seconds
```
❌ Error
No files provided. Please select at least one file.
```
**Solution:** Select at least one PDF, TXT, or MD file

---

#### ❌ "Invalid file type: X. Supported: PDF, TXT, MD"
**When:** User selects unsupported file format
**UI:** Red error message in error alert
**File List:** File shows ❌ with error message
```
❌ Error
Invalid file type: document.exe. Supported: PDF, TXT, MD
```
**Solution:** Use PDF, TXT, MD, YAML, or YML files only

---

#### ❌ "File too large (max 50MB)"
**When:** File size exceeds 50MB
**UI:** File shows ❌ in file list, upload button disabled
```
❌ Error
File report.pdf is too large (max 50MB)
```
**Solution:** Use smaller files or split large documents

---

#### ❌ "File is empty"
**When:** Uploaded file has 0 bytes
**UI:** File shows ❌ in file list
```
❌ Error
File notes.txt is empty
```
**Solution:** Use files with actual content

---

### 2. Network & Connection Errors

#### ❌ "No response from server. Please check if the backend is running on http://127.0.0.1:8000"
**When:** Backend server is offline or unreachable
**UI:** Red error alert, auto-hides after 6 seconds
**Severity:** 🔴 Critical
```
❌ Error
No response from server. Please check if the backend is running on
http://127.0.0.1:8000
```
**Solution:**
```powershell
# Start backend server
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

---

#### ❌ "Network error or server not responding"
**When:** Connection times out after 120 seconds
**UI:** Red error alert
```
❌ Error
Network error or server not responding. Please try again.
```
**Solution:**
1. Check internet connection
2. Verify backend is running
3. Check if port 8000 is available
4. Try with smaller file

---

#### ❌ "CORS Error"
**When:** Frontend and backend not properly configured
**Browser Console:** 
```
Access to XMLHttpRequest at 'http://127.0.0.1:8000/upload'
from origin 'http://localhost:5173' has been blocked by CORS policy
```
**Solution:** (Already fixed in this version)
- Backend CORS is configured for localhost:5173
- Ensure you're using http://localhost:5173 (not 127.0.0.1:5173)

---

### 3. Server-Side Processing Errors

#### ❌ "Error reading file X: [details]"
**When:** Backend can't read uploaded file
**UI:** Red error alert
```
❌ Error
Error reading file report.pdf: File corrupted or unreadable
```
**Solution:**
1. Check file is not corrupted
2. Try re-downloading the file
3. Try uploading a different file

---

#### ❌ "No text content could be extracted from uploaded files. Please check your documents."
**When:** Files uploaded but no readable text found
**UI:** Red error alert, auto-hides after 6 seconds
```
❌ Error
No text content could be extracted from uploaded files.
Please check your documents.
```
**Solution:**
1. Files might be scanned images (need OCR)
2. Try with text-based PDFs
3. Check documents aren't encrypted
4. Upload .txt files as test

---

#### ❌ "Upload error: [technical details]"
**When:** Unexpected server-side error
**UI:** Red error alert with tech details
```
❌ Error
Upload error: Preprocessing failed - Chunk size too small
```
**Solution:** Check backend logs in terminal for details

---

### 4. File Type Specific Errors

#### ❌ "Invalid PDF file or corrupted content"
**When:** PDF file is damaged or not standard
```
❌ Error
Invalid PDF file or corrupted content
```
**Solution:**
1. Try re-saving PDF in another tool
2. Test PDF with online validator
3. Use different PDF

---

#### ❌ "Text encoding error in [filename]"
**When:** Text file has unsupported encoding
```
❌ Error
Text encoding error in notes.txt. Use UTF-8 encoding.
```
**Solution:**
1. Open file in text editor
2. Save as UTF-8 encoding
3. Re-upload

---

### 5. Progress & Loading Errors

#### ❌ "Upload cancelled"
**When:** User navigates away during upload
```
❌ Error
Upload cancelled. Please try again.
```
**Solution:** Don't leave page during upload

---

#### ❌ "Progress update failed"
**When:** Can't get upload progress (rate issue)
```
❌ Error
Progress update failed. Upload may still be processing.
```
**Solution:** Wait for upload to complete, don't refresh

---

### 6. Success Messages (Not Errors)

#### ✅ "Upload Successful!"
**When:** Files successfully processed and indexed
**UI:** Green notification at top, auto-hides after 3 seconds
```
✅ Upload Successful!
Your documents have been processed and indexed successfully.
```
**Next Step:** Go to Query section and ask questions

---

## Common Error Solutions Quick Reference

| Error | Quick Fix | Detailed Fix |
|-------|-----------|-------------|
| "No response from server" | Start backend | See Network Errors section |
| "Invalid file type" | Use PDF/TXT/MD | See File Validation section |
| "File too large" | Use <50MB file | Split document or compress |
| "No text extracted" | Use text-based PDF | Resave PDF or use .txt |
| "No files provided" | Select files | Use drag-drop or click zone |

---

## Error Categories & Meanings

### 🔴 Critical Errors (Blocking)
These prevent upload entirely:
- No files provided
- Backend offline
- Invalid file type

**What to do:** Fix the issue and try again

### 🟠 Warning Errors (Partial)
These affect some files:
- File too large
- File empty
- Invalid encoding

**What to do:** Remove problematic file or fix it

### 🟡 Info Errors (Non-blocking)
These are informational:
- No text extracted
- Processing slow
- Partial data

**What to do:** Try different file or wait longer

---

## Troubleshooting Flowchart

```
Upload fails
    ↓
See error message?
├─ NO → Check browser console (F12)
│         │
│         └─ Report error details
│
└─ YES → Error category?
   ├─ "No response from server"
   │  └─ Start backend server (see Network Errors)
   │
   ├─ "Invalid file type"
   │  └─ Use PDF/TXT/MD files (see File Validation)
   │
   ├─ "File too large"
   │  └─ Use files < 50MB (see File Validation)
   │
   ├─ "No files provided"
   │  └─ Select at least one file (see File Validation)
   │
   ├─ "No text extracted"
   │  └─ Use text-based PDF or TXT (see Processing Errors)
   │
   └─ Other error
      └─ Check Terminal logs
```

---

## How to Report Errors

If you encounter an error not listed here:

1. **Get the exact error message** (copy/paste)
2. **Check browser console** (F12 → Console)
3. **Check backend logs** (terminal window)
4. **Note the file details:**
   - File name
   - File size
   - File type
5. **Try with a different file** to isolate issue

---

## Error Prevention Tips

### ✅ Before Uploading
1. Verify file format (PDF, TXT, MD)
2. Check file size < 50MB
3. Ensure file is not empty
4. Test with small file first
5. Verify backend is running

### ✅ During Upload
1. Don't close browser/tab
2. Don't refresh page
3. Don't navigate away
4. Keep connection stable
5. Wait for success message

### ✅ After Error
1. Read error message carefully
2. Check suggestions above
3. Fix the issue
4. Try again
5. Contact support if persistent

---

## Testing Different Scenarios

### Test 1: Invalid File Type
```
File: document.exe
Expected Error: "Invalid file type: document.exe. Supported: PDF, TXT, MD"
Status: ✅ Works
```

### Test 2: File Too Large
```
File: huge-document.pdf (100MB)
Expected Error: "File too large (max 50MB)"
Status: ✅ Works
```

### Test 3: Empty File
```
File: empty.txt (0 bytes)
Expected Error: "File is empty"
Status: ✅ Works
```

### Test 4: Backend Offline
```
Condition: Backend not running
Expected Error: "No response from server..."
Status: ✅ Works
```

### Test 5: Valid Upload
```
File: document.pdf (2MB)
Expected Result: Green success message
Status: ✅ Works
```

---

## API Response Examples

### Successful Upload Response
```json
{
  "status": "success",
  "message": "Successfully processed 25 chunks from 2 files",
  "index_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "chunks_count": 25
}
```

### Error Response
```json
{
  "detail": "Invalid file type: document.exe. Supported: PDF, TXT, MD"
}
```

### Network Error Response
```json
{
  "detail": "No response from server. Please check if the backend is running on http://127.0.0.1:8000"
}
```

---

## FAQ - Frequently Asked Questions About Errors

**Q: Why does my file get rejected?**
A: Check: file format (PDF/TXT/MD), file size (<50MB), file not empty

**Q: Why "No response from server"?**
A: Backend server not running. Start it with: `python -m uvicorn app.main:app --reload`

**Q: Can I upload .docx files?**
A: No, only PDF, TXT, MD, YAML files. Convert .docx to PDF or TXT first.

**Q: Why is upload so slow?**
A: Models loading first time (~10s). Subsequent uploads faster. Large files take longer.

**Q: Can I upload large files?**
A: Max 50MB per file. Split larger documents into multiple files.

**Q: Do I need API key?**
A: Yes if using GPT models for answers. Set in .env file.

**Q: What if error keeps happening?**
A: Check terminal logs, verify dependencies installed, try different file.

---

## Debug Mode

### Enable Console Logging
```javascript
// In browser console (F12)
localStorage.setItem('DEBUG', 'true')
// Reload page to see detailed logs
```

### Check Backend Logs
```powershell
# Watch terminal where backend is running
# Look for: Upload error, details printed
```

### Network Tab (Browser)
```
1. Press F12
2. Click "Network" tab
3. Try upload
4. Click request to see:
   - Request body (file info)
   - Response (error details)
   - Status (200, 400, 500, etc)
```

---

## Error Code Reference

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad request | Check input format |
| 413 | File too large | Use smaller file |
| 422 | Invalid data | Check file type |
| 500 | Server error | Check backend logs |
| 504 | Gateway timeout | Wait and retry |
| CORS | Permission denied | Check CORS config |

---

## Support & Help

1. **Quick help:** See QUICK_START.md
2. **Full setup:** See SETUP_RUN.md
3. **API docs:** Visit http://127.0.0.1:8000/docs
4. **Browser console:** F12 → Console for details
5. **Backend logs:** Check terminal output

---

Version: 1.0 (2026-01-22)
Last Updated: January 22, 2026
