import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => chatSessions.id),
  content: text("content").notNull(),
  role: text("role").notNull(), // 'user' | 'assistant'
  sentimentScore: integer("sentiment_score"), // 1-5
  createdAt: timestamp("created_at").defaultNow(),
});

export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'breathing' | 'journaling' | 'grounding'
  duration: integer("duration").notNull(), // in minutes
  instructions: jsonb("instructions").notNull(),
  icon: text("icon").notNull(),
});

export const moodEntries = pgTable("mood_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  sessionId: integer("session_id").references(() => chatSessions.id),
  mood: integer("mood").notNull(), // 1-5 scale
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const knowledgeBase = pgTable("knowledge_base", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).pick({
  title: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  sessionId: true,
  content: true,
  role: true,
  sentimentScore: true,
});

export const insertMoodEntrySchema = createInsertSchema(moodEntries).pick({
  sessionId: true,
  mood: true,
  note: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Exercise = typeof exercises.$inferSelect;
export type MoodEntry = typeof moodEntries.$inferSelect;
export type InsertMoodEntry = z.infer<typeof insertMoodEntrySchema>;
export type KnowledgeBase = typeof knowledgeBase.$inferSelect;
