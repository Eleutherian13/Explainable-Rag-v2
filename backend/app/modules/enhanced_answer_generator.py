"""
Enhanced answer generation with better quality and formatting.
"""
from typing import List, Optional, Dict
import os
from openai import OpenAI, APIError


class EnhancedAnswerGenerator:
    """Generate comprehensive, well-formatted answers with citations."""
    
    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-4o-mini"):
        """Initialize enhanced answer generator."""
        self.api_key = api_key or os.getenv('OPENAI_API_KEY')
        self.model = model
        self.client = None
        
        if self.api_key:
            self.client = OpenAI(api_key=self.api_key)
    
    def generate_detailed(self, query: str, context_chunks: List[str]) -> Dict:
        """
        Generate detailed, comprehensive answer.
        
        Args:
            query: User question
            context_chunks: Retrieved document chunks
            
        Returns:
            Dict with answer, summary, key_points, and chunk_citations
        """
        if not self.client:
            return self._generate_fallback_detailed(query, context_chunks)
        
        # Prepare context
        context_lines = []
        for idx, chunk in enumerate(context_chunks):
            context_lines.append(f"[Chunk {idx}]: {chunk}")
        context = "\n\n".join(context_lines)
        context = context[:8000]  # Larger context
        
        # Enhanced system prompt for detailed answers
        system_prompt = """You are an expert AI assistant. Your task is to provide COMPREHENSIVE, DETAILED answers based ONLY on the provided context.

IMPORTANT GUIDELINES:
1. Provide a THOROUGH explanation (500-1000 words minimum when possible)
2. Organize your answer with clear structure and paragraphs
3. Include specific examples from the context
4. Use [Chunk N] notation to cite sources (e.g., "According to [Chunk 2], ...")
5. Create a "Key Points" section with 3-5 bullet points
6. If information spans multiple chunks, mention all relevant sources
7. If the answer requires multiple aspects, organize them clearly
8. NEVER say "based on the provided context" - just provide the information naturally

Format your response as JSON with this structure:
{
    "main_answer": "Your comprehensive answer here (should be detailed and well-organized)",
    "summary": "A concise 2-3 sentence summary",
    "key_points": ["Point 1", "Point 2", "Point 3"],
    "cited_chunks": [0, 1, 2],  // chunk indices cited
    "confidence": 0.85  // 0.0-1.0 confidence score
}"""
        
        user_prompt = f"""Context from documents:
{context}

User Question: {query}

Provide a COMPREHENSIVE answer using the format specified above. Make sure the answer is detailed and informative."""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=2000,
                temperature=0.5
            )
            
            import json
            response_text = response.choices[0].message.content.strip()
            
            # Try to parse JSON
            try:
                data = json.loads(response_text)
            except:
                # Fallback if not valid JSON
                data = {
                    "main_answer": response_text,
                    "summary": response_text[:200],
                    "key_points": [],
                    "cited_chunks": list(range(min(3, len(context_chunks)))),
                    "confidence": 0.7
                }
            
            return data
            
        except APIError as e:
            print(f"OpenAI API error: {e}")
            return self._generate_fallback_detailed(query, context_chunks)
    
    def _generate_fallback_detailed(self, query: str, context_chunks: List[str]) -> Dict:
        """Fallback detailed answer generation."""
        if not context_chunks:
            return {
                "main_answer": "I cannot find relevant information in the provided documents.",
                "summary": "No information found.",
                "key_points": [],
                "cited_chunks": [],
                "confidence": 0.0
            }
        
        # Build answer from top chunks
        answer = f"Based on the provided documents:\n\n"
        for idx, chunk in enumerate(context_chunks[:3]):
            answer += f"[Chunk {idx}]: {chunk}\n\n"
        
        return {
            "main_answer": answer,
            "summary": f"Found {len(context_chunks)} relevant document sections.",
            "key_points": [
                f"Document section {i}: {chunk[:100]}..." 
                for i, chunk in enumerate(context_chunks[:3])
            ],
            "cited_chunks": list(range(min(3, len(context_chunks)))),
            "confidence": 0.6
        }
