"""
Entity extraction module using spaCy.
"""
from typing import List, Dict, Tuple, Set
import re


class EntityExtractor:
    """Extract entities from text using spaCy NER (with fallback)."""
    
    def __init__(self, model_name: str = 'en_core_web_sm'):
        """
        Initialize entity extractor.
        
        Args:
            model_name: spaCy model to use (not used in Python 3.14 due to incompatibility)
        """
        # spaCy is incompatible with Python 3.14, so we use fallback NER exclusively
        self.nlp = None
        self.use_fallback = True
        print("Using fallback NER (spaCy incompatible with Python 3.14)")
    
    def extract_entities(self, text: str) -> List[Dict[str, str]]:
        """
        Extract named entities from text.
        
        Args:
            text: Input text
            
        Returns:
            List of entity dicts with name, type, and start char
        """
        if self.use_fallback:
            return self._extract_entities_fallback(text)
        
        try:
            doc = self.nlp(text)
            entities = []
            
            for ent in doc.ents:
                entities.append({
                    'name': ent.text,
                    'type': ent.label_,
                    'start': ent.start_char
                })
            
            return entities
        except Exception as e:
            print(f"Error in spaCy extraction: {e}. Using fallback...")
            return self._extract_entities_fallback(text)
    
    def _extract_entities_fallback(self, text: str) -> List[Dict[str, str]]:
        """Fallback entity extraction using regex patterns."""
        entities = []
        
        # Simple regex patterns for common entity types
        # Capitalized phrases (potential ORG, PERSON, LOC) including mixed-case like OpenAI and acronyms
        capitalized_pattern = r'\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)\b'
        
        matches = re.finditer(capitalized_pattern, text)
        for match in matches:
            entity_text = match.group(1)
            # Skip very short matches
            if len(entity_text.split()) >= 1 and len(entity_text) > 2:
                entities.append({
                    'name': entity_text,
                    'type': 'UNKNOWN',  # Can't determine type without NER
                    'start': match.start()
                })
        
        # Remove duplicates while preserving order
        seen = set()
        unique_entities = []
        for ent in entities:
            key = (ent['name'].lower(), ent['type'])
            if key not in seen:
                unique_entities.append(ent)
                seen.add(key)
        
        return unique_entities
    
    def extract_from_chunks(self, chunks: List[str]) -> Tuple[List[Dict], Dict]:
        """
        Extract entities from multiple chunks.
        
        Args:
            chunks: List of text chunks
            
        Returns:
            Tuple of (entities list, chunk_entity_mapping dict)
        """
        all_entities = []
        entity_map = {}  # Maps chunk index to entities
        seen_entities: Set[Tuple[str, str]] = set()
        
        for chunk_idx, chunk in enumerate(chunks):
            entities = self.extract_entities(chunk)
            entity_map[chunk_idx] = entities
            
            for ent in entities:
                key = (ent['name'].lower(), ent['type'])
                if key not in seen_entities:
                    all_entities.append({
                        'name': ent['name'],
                        'type': ent['type'],
                        'source_chunk_id': chunk_idx
                    })
                    seen_entities.add(key)
        
        return all_entities, entity_map
    
    def extract_noun_phrases(self, text: str) -> List[str]:
        """
        Extract noun phrases from text (fallback method without spaCy).
        
        Args:
            text: Input text
            
        Returns:
            List of noun phrases
        """
        # Simple fallback: extract capitalized phrases
        capitalized_pattern = r'\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)\b'
        matches = re.finditer(capitalized_pattern, text)
        noun_phrases = [match.group(1) for match in matches]
        return list(set(noun_phrases))  # Remove duplicates
