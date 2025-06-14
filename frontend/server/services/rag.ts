import { storage } from "../storage";
import type { KnowledgeBase } from "@shared/schema";

export interface RAGResult {
  relevantKnowledge: string[];
  sources: KnowledgeBase[];
}

export async function retrieveRelevantKnowledge(query: string): Promise<RAGResult> {
  try {
    // Simple keyword-based search for RAG
    const searchResults = await storage.searchKnowledgeBase(query);
    
    // Extract keywords from the query for better matching
    const keywords = extractKeywords(query);
    
    // Score and rank results
    const scoredResults = searchResults.map(kb => ({
      knowledge: kb,
      score: calculateRelevanceScore(kb, keywords, query)
    }));
    
    // Sort by relevance score and take top 3
    const topResults = scoredResults
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    
    return {
      relevantKnowledge: topResults.map(result => 
        `${result.knowledge.title}: ${result.knowledge.content}`
      ),
      sources: topResults.map(result => result.knowledge)
    };
  } catch (error) {
    console.error('RAG retrieval error:', error);
    return {
      relevantKnowledge: [],
      sources: []
    };
  }
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction - remove common words and extract meaningful terms
  const commonWords = new Set([
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
    'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
    'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
    'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
    'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does',
    'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until',
    'while', 'of', 'at', 'by', 'for', 'with', 'through', 'during', 'before', 'after',
    'above', 'below', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again',
    'further', 'then', 'once', 'to', 'very', 'can', 'will', 'just', 'should', 'now'
  ]);
  
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.has(word));
}

function calculateRelevanceScore(
  knowledge: KnowledgeBase, 
  keywords: string[], 
  originalQuery: string
): number {
  let score = 0;
  const queryLower = originalQuery.toLowerCase();
  const titleLower = knowledge.title.toLowerCase();
  const contentLower = knowledge.content.toLowerCase();
  
  // Direct query match in title (highest weight)
  if (titleLower.includes(queryLower)) {
    score += 10;
  }
  
  // Direct query match in content
  if (contentLower.includes(queryLower)) {
    score += 5;
  }
  
  // Keyword matches in title
  keywords.forEach(keyword => {
    if (titleLower.includes(keyword)) {
      score += 3;
    }
  });
  
  // Keyword matches in content
  keywords.forEach(keyword => {
    if (contentLower.includes(keyword)) {
      score += 1;
    }
  });
  
  // Tag matches
  if (knowledge.tags) {
    knowledge.tags.forEach(tag => {
      if (queryLower.includes(tag.toLowerCase())) {
        score += 2;
      }
      keywords.forEach(keyword => {
        if (tag.toLowerCase().includes(keyword)) {
          score += 1;
        }
      });
    });
  }
  
  // Mental health specific keywords boost
  const mentalHealthKeywords = [
    'anxiety', 'stress', 'depression', 'overwhelm', 'burnout', 'worry', 'panic',
    'sleep', 'insomnia', 'tired', 'exhausted', 'motivation', 'focus', 'concentrate'
  ];
  
  mentalHealthKeywords.forEach(mhKeyword => {
    if (queryLower.includes(mhKeyword)) {
      if (titleLower.includes(mhKeyword) || contentLower.includes(mhKeyword)) {
        score += 4;
      }
    }
  });
  
  return score;
}
