"""
Advanced text reconstruction module for academic PDF extraction.
Handles missing spaces, equations, formatting artifacts, and layout issues.
"""
import re
from typing import List


class TextReconstructor:
    """Reconstructs poorly extracted academic text into clean, readable format."""
    
    def __init__(self):
        # Common academic terms and connectors
        self.academic_words = {
            'abstractive', 'abstract', 'algorithm', 'approach', 'architecture', 'attention',
            'attention', 'background', 'baseline', 'batch', 'bert', 'between', 'bidirectional',
            'bigmodel', 'bilu', 'bleu', 'building', 'bytepart', 'bytepair',
            'computation', 'computational', 'conclusion', 'convolutional', 'crossentropy',
            'dataset', 'decoder', 'decoding', 'dependenc', 'dimensional', 'dimension',
            'dropout', 'during', 'efficient', 'embedding', 'encoder', 'encoding',
            'entailment', 'equation', 'evaluation', 'experiment', 'extraction',
            'feedforward', 'fintuning', 'function', 'furthermore', 'geometry',
            'gradient', 'hardware', 'however', 'hyperparameter',
            'identical', 'implementation', 'importance', 'improvement', 'indexing',
            'inference', 'information', 'initialization', 'input', 'instance',
            'instance', 'interaction', 'introduction', 'investigate', 'kernel',
            'knowledge', 'language', 'layer', 'learning', 'linearization', 'linguistic',
            'logistic', 'longrange', 'machine', 'mathematical', 'matrix', 'mechanism',
            'memory', 'method', 'metric', 'model', 'multilayer', 'multilingual',
            'multihead', 'native', 'network', 'neural', 'neuron', 'normalization',
            'notonly', 'number', 'objective', 'optimization', 'optimizer', 'output',
            'parallel', 'parameter', 'paratext', 'parsing', 'performance', 'perplexity',
            'phrase', 'position', 'positional', 'posterior', 'prediction', 'pretraining',
            'prior', 'probability', 'processing', 'production', 'projection',
            'propagation', 'proposed', 'question', 'ranking', 'reasoning', 'recurrent',
            'reduction', 'reference', 'regularization', 'regression', 'representation',
            'result', 'retrieval', 'return', 'review', 'routine', 'sampling',
            'scalable', 'scale', 'scaling', 'scheduling', 'scheme', 'section',
            'segment', 'segmentation', 'selfattention', 'semantic', 'sentence',
            'sequence', 'sequential', 'setting', 'shallow', 'significance', 'similarity',
            'simplicity', 'simulation', 'single', 'softmax', 'source', 'space',
            'spacy', 'sparse', 'spatial', 'specialized', 'specification', 'speed',
            'stack', 'standard', 'state', 'stateoftheart', 'statement', 'statistics',
            'step', 'strategy', 'structure', 'study', 'subcomponent', 'sublayer',
            'subsequent', 'subset', 'subtask', 'success', 'summary', 'supervision',
            'support', 'surface', 'survey', 'symbol', 'symbolic', 'symmetry',
            'syntactic', 'syntax', 'system', 'systematic', 'target', 'task',
            'tensor', 'test', 'testing', 'text', 'textual', 'than', 'theoretical',
            'theory', 'therefore', 'thinking', 'though', 'thousand', 'three',
            'threshold', 'through', 'throughput', 'time', 'timing', 'tiny',
            'token', 'tokenization', 'topology', 'total', 'traditional', 'training',
            'transduction', 'transfer', 'transformation', 'transformer', 'transition',
            'translation', 'transmission', 'transparent', 'trial', 'tricky',
            'triple', 'trivial', 'token', 'unary', 'understanding', 'unit',
            'universal', 'unknown', 'unsupervised', 'update', 'uptraining', 'usage',
            'useful', 'user', 'utility', 'validation', 'value', 'variable', 'variance',
            'variant', 'variation', 'vector', 'verbosity', 'verification', 'version',
            'vertical', 'viable', 'video', 'view', 'visualization', 'vocabulary',
            'volume', 'voting', 'warmup', 'weight', 'weighted', 'whereby', 'whether',
            'which', 'while', 'whitespace', 'whole', 'widely', 'wikipedia',
            'wildcard', 'window', 'wisdom', 'within', 'without', 'wordpiece',
            'workflow', 'working', 'workspace', 'writing', 'written'
        }
    
    def fix_concatenated_words(self, text: str) -> str:
        """
        Fix concatenated words by intelligently inserting spaces.
        Examples: 'thatis' -> 'that is', 'eachdimension' -> 'each dimension'
        """
        def should_split(prefix: str, suffix: str) -> bool:
            """Check if we should split at this boundary."""
            prefix_lower = prefix.lower()
            suffix_lower = suffix.lower()
            
            # Check if prefix is a known word
            if prefix_lower in self.academic_words:
                return True
            
            # Check common short words
            if len(prefix_lower) >= 2 and prefix_lower in ['is', 'at', 'by', 'in', 'of', 'or', 'as', 'to', 'be', 'we', 'it', 'on', 'do', 'so', 'no', 'up']:
                return True
            
            # Check if suffix is a known word
            if suffix_lower in self.academic_words:
                return True
            
            return False
        
        result = []
        i = 0
        while i < len(text):
            if i > 0 and text[i].isupper() and text[i-1].islower():
                # Find potential word boundary
                for word_len in range(2, min(12, i + 1)):
                    prefix = text[i-word_len:i]
                    suffix = text[i:]
                    if should_split(prefix, suffix):
                        result.append(' ')
                        break
            result.append(text[i])
            i += 1
        
        return ''.join(result)
    
    def fix_spacing_patterns(self, text: str) -> str:
        """Fix common spacing issues from PDF extraction."""
        # Add space after lowercase followed by uppercase
        text = re.sub(r'([a-z])([A-Z])', r'\1 \2', text)
        # Add space before uppercase in camelCase
        text = re.sub(r'([a-z])([A-Z][a-z])', r'\1 \2', text)
        # Add space after period + capital
        text = re.sub(r'(\.)([A-Z])', r'\1 \2', text)
        # Add space between letters and numbers
        text = re.sub(r'([a-zA-Z])(\d)', r'\1 \2', text)
        text = re.sub(r'(\d)([a-zA-Z])', r'\1 \2', text)
        # Add space after closing punctuation when missing
        text = re.sub(r'([\)\]\}])([A-Za-z])', r'\1 \2', text)
        # Multiple spaces to single
        text = re.sub(r' {2,}', ' ', text)
        return text
    
    def fix_equations(self, text: str) -> str:
        """Reconstruct broken equations and mathematical notation."""
        # Fix subscripts/superscripts
        text = re.sub(r'(\w)\_(\w)', r'\1_\2', text)  # word_word
        text = re.sub(r'(\w)\^(\w)', r'\1^\2', text)  # word^word
        
        # Fix matrix notation
        text = re.sub(r'(\w)T(\w)', r'\1^T \2', text)  # wordTword -> word^T word
        
        # Fix Greek letters and math symbols
        replacements = {
            'alpha': 'α', 'beta': 'β', 'gamma': 'γ', 'delta': 'δ',
            'epsilon': 'ε', 'zeta': 'ζ', 'eta': 'η', 'theta': 'θ',
            'lambda': 'λ', 'mu': 'μ', 'nu': 'ν', 'xi': 'ξ',
            'rho': 'ρ', 'sigma': 'σ', 'tau': 'τ', 'phi': 'φ',
            'chi': 'χ', 'psi': 'ψ', 'omega': 'ω'
        }
        
        for word, symbol in replacements.items():
            text = re.sub(rf'\b{word}\b', symbol, text, flags=re.IGNORECASE)
        
        return text
    
    def fix_section_breaks(self, text: str) -> str:
        """Restore proper section and paragraph breaks."""
        # Add line breaks before numbered sections
        text = re.sub(r'(\d+\.\d+)\s+', r'\n\n\1 ', text)
        # Add breaks before section headers (all caps or Title Case patterns)
        text = re.sub(r'([.?!])\s+([A-Z][A-Z\s]{2,})\s+', r'\1\n\n\2 ', text)
        return text
    
    def remove_citation_noise(self, text: str) -> str:
        """Remove extraction artifacts from citations and tables."""
        # Remove orphaned citation numbers
        text = re.sub(r'\s+\d{1,2}(?:\s|$)', ' ', text)
        # Remove table markers and artifacts
        text = re.sub(r'\(cid:\d+\)', '', text)
        text = re.sub(r'\[Chunk\s+\d+\]', '', text)
        return text
    
    def reconstruct(self, text: str) -> str:
        """
        Perform full reconstruction of poorly extracted academic text.
        
        Args:
            text: Raw extracted text with formatting issues
            
        Returns:
            Clean, readable academic prose
        """
        # Normalize line breaks and whitespace (preserve paragraphs)
        text = text.replace('\r\n', '\n').replace('\r', '\n')
        text = re.sub(r'[ \t]+', ' ', text)
        text = re.sub(r' *\n *', '\n', text)
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        # Remove citation noise
        text = self.remove_citation_noise(text)
        
        # Fix equations and math
        text = self.fix_equations(text)
        
        # Fix spacing patterns
        text = self.fix_spacing_patterns(text)
        
        # Fix concatenated words (aggressive)
        text = self.fix_concatenated_words(text)
        
        # Restore section breaks
        text = self.fix_section_breaks(text)
        
        # Final cleanup
        text = re.sub(r' {2,}', ' ', text)  # Multiple spaces
        text = re.sub(r'\s+([.,!?;:])', r'\1', text)  # Space before punctuation
        text = text.strip()
        
        return text


def reconstruct_document_chunks(chunks: List[str]) -> List[str]:
    """
    Reconstruct a list of document chunks.
    
    Args:
        chunks: List of raw extracted text chunks
        
    Returns:
        List of cleaned chunks
    """
    reconstructor = TextReconstructor()
    return [reconstructor.reconstruct(chunk) for chunk in chunks]
