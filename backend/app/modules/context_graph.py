"""
Context-aware knowledge graph builder.
Creates focused knowledge graphs limited to retrieved document context.
"""
from typing import List, Dict, Set
import networkx as nx


class ContextualGraphBuilder:
    """Build knowledge graphs focused on retrieved context only."""
    
    def __init__(self):
        """Initialize contextual graph builder."""
        self.graph = nx.Graph()
        self.source_references = {}  # Track chunk origins of edges
    
    def build_context_graph(
        self,
        entities: List[Dict],
        retrieved_chunk_indices: Set[int],
        chunks: List[str],
        entity_chunk_map: Dict
    ) -> nx.Graph:
        """
        Build knowledge graph from entities retrieved in query context.
        
        Args:
            entities: All extracted entities
            retrieved_chunk_indices: Indices of chunks retrieved for this query
            chunks: All text chunks
            entity_chunk_map: Mapping of chunk index to entities in that chunk
            
        Returns:
            NetworkX graph with only context-relevant entities
        """
        self.graph = nx.Graph()
        self.source_references = {}
        
        # Filter entities to only those in retrieved chunks
        context_entities = [
            ent for ent in entities
            if ent.get('source_chunk_id', 0) in retrieved_chunk_indices
        ]
        
        # Add entity nodes
        for entity in context_entities:
            self.graph.add_node(
                entity['name'],
                type=entity['type'],
                source_chunk=entity.get('source_chunk_id', 0)
            )
        
        # Add edges for co-occurrence within retrieved chunks
        self._add_cooccurrence_edges(context_entities, retrieved_chunk_indices, entity_chunk_map)
        
        return self.graph
    
    def _add_cooccurrence_edges(
        self,
        context_entities: List[Dict],
        retrieved_chunk_indices: Set[int],
        entity_chunk_map: Dict
    ):
        """
        Add edges for entities that co-occur in same retrieved chunk.
        
        Args:
            context_entities: Entities to include
            retrieved_chunk_indices: Indices of retrieved chunks
            entity_chunk_map: Mapping of chunk to entities
        """
        entity_names = {ent['name'] for ent in context_entities}
        
        for chunk_idx in retrieved_chunk_indices:
            if chunk_idx not in entity_chunk_map:
                continue
            
            chunk_entities = entity_chunk_map[chunk_idx]
            
            # Get entity names in this chunk that are in context
            names_in_chunk = [
                ent['name'] for ent in chunk_entities
                if ent['name'] in entity_names
            ]
            
            # Create edges between all pairs
            for i, name1 in enumerate(names_in_chunk):
                for name2 in names_in_chunk[i+1:]:
                    if name1 != name2:
                        edge_key = tuple(sorted([name1, name2]))
                        self.graph.add_edge(
                            name1,
                            name2,
                            relation='co-occurs',
                            chunk_idx=chunk_idx,
                            weight=1.0
                        )
                        
                        # Track source reference
                        if edge_key not in self.source_references:
                            self.source_references[edge_key] = []
                        self.source_references[edge_key].append({
                            'chunk_idx': chunk_idx,
                            'entities': [name1, name2]
                        })
    
    def get_graph_data(self) -> Dict:
        """
        Convert NetworkX graph to JSON-serializable format.
        
        Returns:
            Dict with nodes and edges for visualization
        """
        nodes = []
        edges = []
        
        # Add nodes
        for node in self.graph.nodes():
            node_data = self.graph.nodes[node]
            nodes.append({
                'id': str(node),
                'label': str(node),
                'type': node_data.get('type', 'UNKNOWN')
            })
        
        # Add edges
        seen_edges = set()
        for source, target, data in self.graph.edges(data=True):
            edge_key = tuple(sorted([source, target]))
            if edge_key not in seen_edges:
                edges.append({
                    'source': str(source),
                    'target': str(target),
                    'label': data.get('relation', 'related-to')
                })
                seen_edges.add(edge_key)
        
        return {
            'nodes': nodes,
            'edges': edges
        }
    
    def get_relationships(self) -> List[Dict]:
        """
        Get relationships from graph.
        
        Returns:
            List of relationship dicts with source tracking
        """
        relationships = []
        seen = set()
        
        for source, target, data in self.graph.edges(data=True):
            rel_key = tuple(sorted([source, target]))
            if rel_key not in seen:
                relationships.append({
                    'from_entity': str(source),
                    'to_entity': str(target),
                    'relation': data.get('relation', 'related-to'),
                    'chunk_idx': data.get('chunk_idx', 0)
                })
                seen.add(rel_key)
        
        return relationships
