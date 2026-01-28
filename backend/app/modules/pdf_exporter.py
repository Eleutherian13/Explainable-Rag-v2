"""
PDF export functionality for answers and results.
"""
from typing import List, Dict, Optional
from datetime import datetime


class PDFExporter:
    """Export answers and analysis to PDF format."""
    
    @staticmethod
    def generate_pdf_content(
        query: str,
        answer: str,
        summary: str,
        key_points: List[str],
        entities: List[Dict],
        chunks: List[Dict],
        confidence: float,
        pipeline_data: Dict
    ) -> str:
        """
        Generate PDF content as HTML (for conversion).
        
        Args:
            query: Original query
            answer: Generated answer
            summary: Answer summary
            key_points: Key points from answer
            entities: Extracted entities
            chunks: Source chunks
            confidence: Confidence score
            pipeline_data: Data pipeline information
            
        Returns:
            HTML string for PDF generation
        """
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 40px;
            color: #333;
            line-height: 1.6;
        }}
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }}
        .header h1 {{
            margin: 0 0 10px 0;
            font-size: 28px;
        }}
        .metadata {{
            background: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
            font-size: 12px;
        }}
        .section {{
            margin: 30px 0;
            page-break-inside: avoid;
        }}
        .section h2 {{
            background: #667eea;
            color: white;
            padding: 10px 15px;
            border-radius: 4px;
            margin: 20px 0 15px 0;
            font-size: 18px;
        }}
        .section h3 {{
            color: #667eea;
            margin: 15px 0 10px 0;
            font-size: 14px;
        }}
        .answer {{
            background: #f9f9f9;
            padding: 15px;
            border-left: 4px solid #667eea;
            border-radius: 4px;
            margin: 10px 0;
        }}
        .summary {{
            background: #e8f4f8;
            padding: 12px;
            border-left: 4px solid #0288d1;
            border-radius: 4px;
        }}
        .key-points {{
            background: #f3e5f5;
            padding: 12px;
            border-left: 4px solid #9c27b0;
            border-radius: 4px;
        }}
        .key-points ul {{
            margin: 10px 0;
            padding-left: 20px;
        }}
        .key-points li {{
            margin: 8px 0;
        }}
        .entity {{
            display: inline-block;
            background: #e1f5fe;
            color: #01579b;
            padding: 5px 10px;
            margin: 5px 5px 5px 0;
            border-radius: 20px;
            font-size: 12px;
            border: 1px solid #01579b;
        }}
        .entity.highlight {{
            background: #fff9c4;
            color: #f57f17;
            border-color: #f57f17;
        }}
        .chunk {{
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
            font-size: 13px;
            color: #856404;
        }}
        .confidence {{
            font-size: 12px;
            color: #666;
            margin: 10px 0;
        }}
        .confidence-bar {{
            background: #ddd;
            height: 6px;
            border-radius: 3px;
            overflow: hidden;
            margin: 5px 0 10px 0;
        }}
        .confidence-fill {{
            background: linear-gradient(90deg, #4caf50, #45a049);
            height: 100%;
        }}
        .pipeline {{
            background: #f5f5f5;
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 4px;
            font-size: 12px;
        }}
        .pipeline-step {{
            margin: 8px 0;
            padding: 8px;
            background: white;
            border-left: 3px solid #667eea;
            border-radius: 2px;
        }}
        .pipeline-step strong {{
            color: #667eea;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
        }}
        table th {{
            background: #667eea;
            color: white;
            padding: 10px;
            text-align: left;
            font-size: 12px;
        }}
        table td {{
            padding: 8px 10px;
            border-bottom: 1px solid #ddd;
            font-size: 12px;
        }}
        table tr:nth-child(even) {{
            background: #f9f9f9;
        }}
        .footer {{
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #ddd;
            font-size: 11px;
            color: #999;
            text-align: center;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Explainable RAG Analysis Report</h1>
        <div class="metadata">
            <strong>Generated:</strong> {datetime.now().strftime('%B %d, %Y at %H:%M:%S')}<br>
            <strong>Query:</strong> {query}<br>
            <strong>Status:</strong> Completed Successfully
        </div>
    </div>

    <div class="section">
        <h2>📝 Answer</h2>
        <div class="answer">
            {answer}
        </div>
    </div>

    <div class="section">
        <h2>💡 Summary</h2>
        <div class="summary">
            {summary}
        </div>
    </div>

    <div class="section">
        <h2>⭐ Key Points</h2>
        <div class="key-points">
            <ul>
                {''.join(f'<li>{point}</li>' for point in key_points)}
            </ul>
        </div>
    </div>

    <div class="section">
        <h2>🎯 Confidence Score</h2>
        <div class="confidence">
            <strong>Confidence: {confidence:.1%}</strong>
            <div class="confidence-bar">
                <div class="confidence-fill" style="width: {confidence * 100}%"></div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>🏷️ Extracted Entities</h2>
        <div>
            {''.join(f'<span class="entity">{e["name"]} <small>[{e["type"]}]</small></span>' for e in entities[:20])}
        </div>
    </div>

    <div class="section">
        <h2>📚 Source Documents</h2>
        <div>
            {''.join(f'<div class="chunk"><strong>Source {i}:</strong> {chunk.get("text", chunk)[:300]}...</div>' for i, chunk in enumerate(chunks[:5]))}
        </div>
    </div>

    <div class="section">
        <h2>🔄 Data Pipeline</h2>
        <div class="pipeline">
            <div class="pipeline-step">
                <strong>1. Document Upload</strong><br>
                Files processed: {pipeline_data.get('files_uploaded', 'N/A')}<br>
                Total size: {pipeline_data.get('total_size', 'N/A')}
            </div>
            <div class="pipeline-step">
                <strong>2. Chunking & Preprocessing</strong><br>
                Chunks created: {pipeline_data.get('chunks_count', 'N/A')}<br>
                Average chunk size: {pipeline_data.get('avg_chunk_size', 'N/A')}
            </div>
            <div class="pipeline-step">
                <strong>3. Embedding & Indexing</strong><br>
                Embedding model: {pipeline_data.get('embedding_model', 'all-MiniLM-L6-v2')}<br>
                Index type: FAISS (Flat L2)
            </div>
            <div class="pipeline-step">
                <strong>4. Retrieval</strong><br>
                Chunks retrieved: {pipeline_data.get('retrieved_chunks', 'N/A')}<br>
                Mean similarity: {pipeline_data.get('mean_similarity', 'N/A')}
            </div>
            <div class="pipeline-step">
                <strong>5. Entity Extraction</strong><br>
                Entities found: {len(entities)}<br>
                Method: NER + Fallback Regex
            </div>
            <div class="pipeline-step">
                <strong>6. Answer Generation</strong><br>
                Model: {pipeline_data.get('llm_model', 'gpt-4o-mini')}<br>
                Method: RAG with context
            </div>
        </div>
    </div>

    <div class="footer">
        <p>This report was automatically generated by Explainable RAG with Knowledge Graphs</p>
        <p>© 2026 Dataforge - All rights reserved</p>
    </div>
</body>
</html>
"""
        return html
