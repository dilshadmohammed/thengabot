import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertChatSessionSchema, 
  insertMessageSchema, 
  insertMoodEntrySchema 
} from "@shared/schema";
import { generateEmpathethicResponse } from "./services/openai";
import { retrieveRelevantKnowledge } from "./services/rag";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a new chat session
  app.post("/api/chat/sessions", async (req, res) => {
    try {
      const validatedData = insertChatSessionSchema.parse(req.body);
      const session = await storage.createChatSession(validatedData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: "Invalid session data" });
    }
  });

  // Get chat sessions
  app.get("/api/chat/sessions", async (req, res) => {
    try {
      const sessions = await storage.getChatSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  // Get messages for a session
  app.get("/api/chat/sessions/:sessionId/messages", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const messages = await storage.getMessagesBySession(sessionId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Send a message and get AI response
  app.post("/api/chat/sessions/:sessionId/messages", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const { content } = req.body;
      
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: "Message content is required" });
      }

      // Create user message
      const userMessage = await storage.createMessage({
        sessionId,
        content,
        role: "user"
      });

      // Get conversation history
      const allMessages = await storage.getMessagesBySession(sessionId);
      const conversationHistory = allMessages
        .slice(-10) // Last 10 messages for context
        .map(msg => `${msg.role}: ${msg.content}`);

      // Retrieve relevant knowledge using RAG
      const ragResult = await retrieveRelevantKnowledge(content);

      // Generate AI response
      const aiResponse = await generateEmpathethicResponse(
        content,
        conversationHistory,
        ragResult.relevantKnowledge
      );

      // Create assistant message
      const assistantMessage = await storage.createMessage({
        sessionId,
        content: aiResponse.message,
        role: "assistant",
        sentimentScore: aiResponse.sentimentScore
      });

      res.json({
        userMessage,
        assistantMessage,
        sentimentScore: aiResponse.sentimentScore,
        suggestedExercises: aiResponse.suggestedExercises,
        concernLevel: aiResponse.concernLevel
      });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  // Get all exercises
  app.get("/api/exercises", async (req, res) => {
    try {
      const exercises = await storage.getExercises();
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch exercises" });
    }
  });

  // Get specific exercise
  app.get("/api/exercises/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const exercise = await storage.getExerciseById(id);
      if (!exercise) {
        return res.status(404).json({ error: "Exercise not found" });
      }
      res.json(exercise);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch exercise" });
    }
  });

  // Create mood entry
  app.post("/api/mood", async (req, res) => {
    try {
      const validatedData = insertMoodEntrySchema.parse(req.body);
      const moodEntry = await storage.createMoodEntry(validatedData);
      res.json(moodEntry);
    } catch (error) {
      res.status(400).json({ error: "Invalid mood entry data" });
    }
  });

  // Get mood entries for a session
  app.get("/api/mood/:sessionId", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const moodEntries = await storage.getMoodEntriesBySession(sessionId);
      res.json(moodEntries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch mood entries" });
    }
  });

  // Search knowledge base
  app.get("/api/knowledge/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: "Search query is required" });
      }
      
      const results = await storage.searchKnowledgeBase(q);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to search knowledge base" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
