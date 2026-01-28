# 🚀 Quick Start Guide - Testing Enhanced Features

## Current Status
✅ **Backend**: Running on http://127.0.0.1:8000  
✅ **Frontend**: Running on http://localhost:5173  
✅ **All Features**: Implemented and ready to test

## Step 1: Open the Application

Open your browser and go to:
```
http://localhost:5173
```

You should see the Dataforge dashboard with:
- Document upload area
- Query form
- 8 tabs at the top (Answer, Summary, Key Points, Pipeline, Export, Entities, Sources, Graph)

## Step 2: Upload a Document

1. **Click** the upload area (or drag & drop)
2. **Select** a text file or PDF
3. **Wait** for the upload to complete
4. You should see a success message

### Sample Documents to Test With
Create a test file `sample.txt` with content like:
```
Artificial Intelligence is transforming industries.
Machine Learning enables computers to learn from data.
Deep Learning uses neural networks with multiple layers.
Natural Language Processing helps understand human language.
Reinforcement Learning teaches systems through rewards.
```

## Step 3: Submit a Query

1. **Type** a question in the query box
   - Example: "What is machine learning and how does it differ from AI?"
   - Example: "Explain deep learning in simple terms"
   - Example: "How do neural networks work?"

2. **Click** "Ask" or press Enter
3. **Wait** 2-5 seconds for the answer (includes LLM processing)

## Step 4: Explore the Results Tabs

### Tab 1: 📝 Answer
- **What**: Full detailed answer to your question
- **Expected**: 500+ words of comprehensive explanation
- **New Feature**: No truncation, full answer visible

### Tab 2: 📋 Summary  
- **What**: Concise 1-2 paragraph summary
- **Expected**: Quick overview of the main points
- **New Feature**: Automatically generated from detailed answer

### Tab 3: ⭐ Key Points
- **What**: 3-5 main takeaways from the answer
- **Expected**: Bulleted list of important concepts
- **New Feature**: Structured extraction of key concepts

### Tab 4: 🔄 Pipeline
- **What**: Visualization of how data flows through the system
- **Expected**: 6 upload stages and 3 query stages with icons
- **New Feature**: Shows technology stack for each stage
- **Interaction**: Click any stage to see details

### Tab 5: ⬇️ Export
- **What**: Download results as PDF
- **Expected**: Professional PDF with all answer sections
- **New Feature**: One-click download with styling
- **How To**: Click "📥 Download PDF" button

### Tab 6: 🏷️ Entities
- **What**: Interactive list of extracted entities
- **Expected**: People, organizations, locations mentioned
- **New Feature**: Search, color-coded types, action buttons
- **Interaction**: 
  - Type in search box to filter
  - Click entity to see mentions
  - Use action buttons for future features

### Tab 7: 📄 Sources
- **What**: Source documents with highlighting
- **Expected**: Document chunks with text selection
- **New Feature**: Real-time highlighting and citation mapping
- **Interaction**:
  - Click next/previous to navigate chunks
  - Select text in document
  - See related citations appear

### Tab 8: 📊 Graph
- **What**: Knowledge graph of entities and relationships
- **Expected**: Visual network of concepts
- **Existing Feature**: Already available, not changed

## Step 5: Test Each Feature

### Test Better Answers
- [ ] View Answer tab and verify it's long (500+ words)
- [ ] Check Summary tab for concise version
- [ ] Look at Key Points tab for main takeaways

### Test PDF Export
- [ ] Click Export tab
- [ ] Click "📥 Download PDF" button
- [ ] Check browser downloads folder
- [ ] Open PDF and verify it contains:
  - Your question
  - The full answer
  - Summary section
  - Key points section
  - Pipeline information
  - Entities table
  - Source citations

### Test Pipeline Visualization
- [ ] Click Pipeline tab
- [ ] See 6 upload stages (📤✂️🔢🗂️🏷️🔗)
- [ ] See 3 query stages (🔍💡📌)
- [ ] Hover over stages for descriptions
- [ ] Click to expand and see technology details

### Test Entity Explorer
- [ ] Click Entities tab
- [ ] See list of extracted entities
- [ ] Notice color coding by type
- [ ] Type in search box to filter
- [ ] Click an entity to see mentions
- [ ] Check how many times entity appears
- [ ] View related document chunks

### Test Document Highlighting
- [ ] Click Sources tab
- [ ] See document chunks display
- [ ] Use next/previous buttons to navigate
- [ ] Select some text in the document
- [ ] Watch the selection highlight appear
- [ ] See citation relevance scores update
- [ ] Navigate to different chunks

## Expected Behavior

### Before These Enhancements
❌ Answers were short and sometimes random  
❌ No way to export results  
❌ Couldn't see data processing flow  
❌ Entities weren't interactive  
❌ Source documents not highlightable  

### After These Enhancements
✅ Answers are 500-1000+ words and coherent  
✅ PDF export with one click  
✅ Clear visualization of pipeline stages  
✅ Search and explore entities  
✅ Real-time document highlighting  

## Troubleshooting

### Issue: "Index not found" error
**Cause**: No documents uploaded yet  
**Fix**: Upload a document first, then submit query

### Issue: Answer is very short or unhelpful
**Cause**: OpenAI API not configured  
**Fix**: Set OPENAI_API_KEY environment variable

### Issue: PDF Download doesn't work
**Cause**: Browser security or missing dependency  
**Fix**: Clear browser cache, check browser console for errors

### Issue: No entities showing
**Cause**: spaCy NER model not available  
**Fix**: Run `python -m spacy download en_core_web_sm`

### Issue: Pipeline tab empty
**Cause**: Backend needs restart  
**Fix**: Restart backend server

### Issue: Highlighting not working
**Cause**: JavaScript error in browser  
**Fix**: Open browser console (F12) and check for errors

## Performance Notes

- First query takes 2-5 seconds (LLM API call)
- Subsequent queries faster if cached
- PDF generation is fast (under 1 second)
- Pipeline visualization instant
- Entity search instant (<100ms)
- Document highlighting real-time

## Next Steps After Testing

1. **If everything works**: Congratulations! ✅
   - All features are functional and integrated
   - Ready for production deployment
   - Consider adding advanced features (see COMPLETION_REPORT.md)

2. **If you find issues**: 
   - Check browser console (F12) for errors
   - Check backend logs for exceptions
   - Review TROUBLESHOOTING section
   - Check ENHANCEMENTS.md for detailed docs

3. **To dive deeper**:
   - Review [COMPLETION_REPORT.md](./COMPLETION_REPORT.md)
   - Check [ENHANCEMENTS.md](./ENHANCEMENTS.md)
   - Explore source code in `backend/app/modules/`
   - Explore components in `frontend/src/components/`

## Commands Quick Reference

```bash
# Start backend
cd backend && python -m uvicorn app.main:app --reload

# Start frontend
cd frontend && npm run dev

# Stop servers
# Ctrl+C in each terminal

# View backend API docs
http://localhost:8000/docs

# Run tests
python test_enhancements.py

# Build frontend
npm run build

# Backend tests
cd backend && pytest -v
```

## File Locations

- **Backend Code**: `backend/app/modules/`
  - enhanced_answer_generator.py
  - pdf_exporter.py
  - pipeline_tracker.py

- **Frontend Components**: `frontend/src/components/`
  - PDFExport.jsx
  - DataPipeline.jsx
  - EntityExplorer.jsx
  - DocumentHighlighter.jsx
  - Dashboard.jsx (updated)

- **Documentation**
  - ENHANCEMENTS.md - Detailed feature docs
  - COMPLETION_REPORT.md - This report
  - test_enhancements.py - Automated tests

## Timeline for Full Feature Testing

- **5 minutes**: Upload document and ask basic question
- **10 minutes**: Test all 8 tabs
- **15 minutes**: Test PDF download and open it
- **20 minutes**: Try different queries and documents
- **25 minutes**: Test edge cases and error scenarios

---

**Version**: 1.1.0  
**Last Updated**: January 28, 2026  
**Status**: ✅ Ready to Test
