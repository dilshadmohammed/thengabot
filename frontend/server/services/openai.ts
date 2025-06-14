import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || ""
});

export interface ChatResponse {
  message: string;
  sentimentScore: number;
  suggestedExercises?: string[];
  concernLevel: 'low' | 'medium' | 'high';
}

export async function generateEmpathethicResponse(
  userMessage: string, 
  conversationHistory: string[], 
  relevantKnowledge: string[]
): Promise<ChatResponse> {
  try {
    const systemPrompt = `You are MindfulBot, an empathetic AI mental health companion. Your role is to:
    - Provide supportive, empathetic responses
    - Suggest appropriate mental health exercises when relevant
    - Never provide medical advice or diagnosis
    - Always maintain a warm, understanding tone
    - Encourage professional help when appropriate
    
    Knowledge base context:
    ${relevantKnowledge.join('\n\n')}
    
    Conversation history:
    ${conversationHistory.join('\n')}
    
    Respond with JSON in this format:
    {
      "message": "your empathetic response",
      "sentimentScore": 1-5 (user's emotional state),
      "suggestedExercises": ["exercise1", "exercise2"] (optional),
      "concernLevel": "low|medium|high"
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 500
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      message: result.message || "I'm here to listen and support you. How are you feeling?",
      sentimentScore: Math.max(1, Math.min(5, result.sentimentScore || 3)),
      suggestedExercises: result.suggestedExercises || [],
      concernLevel: result.concernLevel || 'low'
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Fallback empathetic response
    return {
      message: "I'm here to listen and support you. Sometimes I have trouble finding the right words, but I want you to know that your feelings are valid and you're not alone.",
      sentimentScore: 3,
      concernLevel: 'low'
    };
  }
}

export async function analyzeSentiment(text: string): Promise<{
  rating: number;
  confidence: number;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a sentiment analysis expert. Analyze the sentiment of the text and provide a rating from 1 (very negative) to 5 (very positive) and a confidence score between 0 and 1. Respond with JSON in this format: { 'rating': number, 'confidence': number }"
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      rating: Math.max(1, Math.min(5, Math.round(result.rating || 3))),
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5))
    };
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return {
      rating: 3,
      confidence: 0.5
    };
  }
}
