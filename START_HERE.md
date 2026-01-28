# QUICK START - Run This NOW

## Step 1: Kill Any Existing Processes

In PowerShell:
```powershell
Get-Process python | Stop-Process -Force
Start-Sleep -Seconds 2
```

## Step 2: Start Backend (TERMINAL 1)

Open a NEW PowerShell window and run:

```powershell
cd c:\Users\manas\OneDrive\Desktop\Dataforge
python run_backend.py
```

**You should see:**
```
[*] Starting Dataforge Backend Server...
[*] Server will run on http://127.0.0.1:8000
[*] API Docs: http://127.0.0.1:8000/docs
[*] Press CTRL+C to stop

INFO:     Started server process [XXXX]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

**KEEP THIS TERMINAL OPEN AND RUNNING!**

---

## Step 3: Start Frontend (TERMINAL 2)

Open ANOTHER NEW PowerShell window and run:

```powershell
cd c:\Users\manas\OneDrive\Desktop\Dataforge\frontend
npm run dev
```

**You should see:**
```
  VITE v4.x.x ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

**KEEP THIS TERMINAL OPEN AND RUNNING!**

---

## Step 4: Open Browser

Go to: http://localhost:5173

You should see the Dataforge UI.

---

## Step 5: Test Upload

1. Click "Upload Documents"
2. Select a PDF or TXT file
3. Click "Upload"
4. Wait for "Upload complete!" message
5. Type a question and click "Ask"
6. See the answer appear ✓

---

## Troubleshooting

### Backend doesn't start
- Make sure you're in the right directory
- Make sure port 8000 is free: `netstat -ano | findstr :8000`
- Make sure Python 3.12+ is installed: `python --version`

### Frontend doesn't start
- Make sure you're in `frontend` folder
- Make sure Node.js 18+ is installed: `node --version`
- Make sure npm packages installed: `npm install`

### "No response from server" error
- Check backend terminal - it should say "Application startup complete"
- Check frontend console (F12) for CORS or network errors
- Make sure both ports 8000 and 5173 are open

### Upload fails
- Check backend logs for errors
- Try with a smaller file (< 100 KB)
- Wait 30-60 seconds - embedding takes time

---

## Key Points

✓ Keep BOTH terminals open while testing
✓ Backend on port 8000
✓ Frontend on port 5173
✓ Don't close either terminal!

---

Status: Ready to test
