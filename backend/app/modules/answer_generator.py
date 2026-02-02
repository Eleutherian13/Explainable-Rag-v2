"""
Answer generation module with LLM integration.
"""
from typing import List, Optional, Tuple, Dict
import os
import re
from openai import OpenAI, APIError
from app.modules.llm_config import resolve_llm_config


class AnswerGenerator:
    """Generate answers using LLM with retrieved context."""
    
    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-4o-mini"):
        """
        Initialize answer generator.
        
        Args:
            api_key: OpenAI API key (defaults to OPENAI_API_KEY env var)
            model: Model name to use
        """
        config = resolve_llm_config(default_model=model)
        self.api_key = api_key or config.api_key
        self.model = config.model
        self.client = None
        
        if self.api_key:
            if config.base_url:
                self.client = OpenAI(api_key=self.api_key, base_url=config.base_url)
            else:
                self.client = OpenAI(api_key=self.api_key)
    
    def generate(self, query: str, context_chunks: List[str], max_tokens: int = 500) -> str:
        """
        Generate answer from query and context.
        
        Args:
            query: User query
            context_chunks: Retrieved context chunks
            max_tokens: Maximum tokens in response
            
        Returns:
            Generated answer
        """
        if not self.client:
            return self._generate_fallback(query, context_chunks)
        
        # Prepare context with chunk markers for citation
        context_lines = []
        for idx, chunk in enumerate(context_chunks):
            context_lines.append(f"[Chunk {idx}] {chunk}")
        context = "\n\n".join(context_lines)
        context = context[:5000]  # Limit context size
        
        # Create prompt with citation instructions
        system_prompt = """You are a helpful assistant that answers questions using ONLY the provided context.
    Do not use external knowledge. If the answer is not in the context, say "I cannot find this information in the provided documents."

    Write a clear, readable answer with short paragraphs or bullet points where appropriate.
    If the context looks like a resume or profile, format sections with headings and bullet points.
    Fix spacing issues or concatenated words in your response.

    When answering, reference the chunk numbers that support your answer using [Chunk N] notation."""
        
        user_prompt = f"""Context:
{context}

Question: {query}

Answer (cite chunks used): """
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=max_tokens,
                temperature=0.3
            )
            
            if response.choices and response.choices[0].message and response.choices[0].message.content:
                answer = response.choices[0].message.content.strip()
                return answer
            else:
                return self._generate_fallback(query, context_chunks)
            
        except APIError as e:
            print(f"OpenAI API error: {e}")
            return self._generate_fallback(query, context_chunks)
    
    def extract_cited_chunks(self, answer: str) -> List[int]:
        """
        Extract chunk indices from answer text.
        Looks for [Chunk N] references in the answer.
        
        Args:
            answer: Generated answer text that may contain chunk references
            
        Returns:
            List of chunk indices mentioned in answer
        """
        # Find all [Chunk N] references
        chunk_pattern = r'\[Chunk\s+(\d+)\]'
        matches = re.findall(chunk_pattern, answer)
        
        # Convert to integers and remove duplicates
        cited_chunks = list(set(int(m) for m in matches))
        cited_chunks.sort()
        
        return cited_chunks
    
    def _generate_fallback(self, query: str, context_chunks: List[str]) -> str:
        """
        Fallback answer generation without LLM.
        Improved to provide diverse, complete answers.
        
        Args:
            query: User query
            context_chunks: Retrieved context chunks
            
        Returns:
            Full answer with complete content
        """
        if not context_chunks:
            return "I cannot find relevant information in the provided documents."
        
        # Extract meaningful keywords (length > 2)
        query_words = set(w.lower() for w in query.split() if len(w) > 2)
        
        # Score each chunk based on keyword overlap
        best_chunk = None
        best_score = -1
        best_chunk_idx = 0
        
        for idx, chunk in enumerate(context_chunks):
            chunk_words = set(w.lower() for w in chunk.split() if len(w) > 2)
            overlap = len(query_words & chunk_words)
            if overlap > best_score:
                best_score = overlap
                best_chunk = chunk
                best_chunk_idx = idx
        
        # If no overlap found, use the most relevant chunk (first retrieved)
        if best_chunk is None:
            best_chunk = context_chunks[0]
            best_chunk_idx = 0
        
        # Build a concise, readable fallback using top chunks
        top_chunks = context_chunks[:3]
        lines = ["Relevant information found:"]
        for idx, chunk in enumerate(top_chunks):
            snippet = chunk.strip()
            if len(snippet) > 400:
                snippet = snippet[:400].rsplit(' ', 1)[0] + "..."
            lines.append(f"- {snippet} [Chunk {idx}]")

        return "\n".join(lines)
