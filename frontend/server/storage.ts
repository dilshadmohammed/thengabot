import { 
  users, 
  chatSessions, 
  messages, 
  exercises, 
  moodEntries,
  knowledgeBase,
  type User, 
  type InsertUser,
  type ChatSession,
  type InsertChatSession,
  type Message,
  type InsertMessage,
  type Exercise,
  type MoodEntry,
  type InsertMoodEntry,
  type KnowledgeBase
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Chat session methods
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSession(id: number): Promise<ChatSession | undefined>;
  getChatSessions(): Promise<ChatSession[]>;

  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesBySession(sessionId: number): Promise<Message[]>;

  // Exercise methods
  getExercises(): Promise<Exercise[]>;
  getExerciseById(id: number): Promise<Exercise | undefined>;

  // Mood entry methods
  createMoodEntry(moodEntry: InsertMoodEntry): Promise<MoodEntry>;
  getMoodEntriesBySession(sessionId: number): Promise<MoodEntry[]>;

  // Knowledge base methods
  getKnowledgeBase(): Promise<KnowledgeBase[]>;
  searchKnowledgeBase(query: string): Promise<KnowledgeBase[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private chatSessions: Map<number, ChatSession>;
  private messages: Map<number, Message>;
  private exercises: Map<number, Exercise>;
  private moodEntries: Map<number, MoodEntry>;
  private knowledgeBase: Map<number, KnowledgeBase>;
  private currentUserId: number;
  private currentSessionId: number;
  private currentMessageId: number;
  private currentExerciseId: number;
  private currentMoodEntryId: number;
  private currentKnowledgeId: number;

  constructor() {
    this.users = new Map();
    this.chatSessions = new Map();
    this.messages = new Map();
    this.exercises = new Map();
    this.moodEntries = new Map();
    this.knowledgeBase = new Map();
    this.currentUserId = 1;
    this.currentSessionId = 1;
    this.currentMessageId = 1;
    this.currentExerciseId = 1;
    this.currentMoodEntryId = 1;
    this.currentKnowledgeId = 1;

    this.initializeExercises();
    this.initializeKnowledgeBase();
  }

  private initializeExercises() {
    const exercisesData: Exercise[] = [
      {
        id: 1,
        title: "4-7-8 Breathing",
        description: "A calming breathing technique to reduce anxiety",
        type: "breathing",
        duration: 5,
        instructions: {
          steps: [
            "Sit comfortably and close your eyes",
            "Inhale through your nose for 4 counts",
            "Hold your breath for 7 counts", 
            "Exhale through your mouth for 8 counts",
            "Repeat 4-6 times"
          ]
        },
        icon: "fas fa-lungs"
      },
      {
        id: 2,
        title: "Mindful Journaling",
        description: "Express your thoughts and feelings through writing",
        type: "journaling",
        duration: 10,
        instructions: {
          prompts: [
            "What's one thing you're grateful for today?",
            "What's one challenge you're facing?",
            "What's one small step you can take?",
            "How are you feeling right now?"
          ]
        },
        icon: "fas fa-pen"
      },
      {
        id: 3,
        title: "5-4-3-2-1 Grounding",
        description: "Ground yourself in the present moment",
        type: "grounding",
        duration: 3,
        instructions: {
          steps: [
            "Name 5 things you can see",
            "Name 4 things you can touch",
            "Name 3 things you can hear",
            "Name 2 things you can smell",
            "Name 1 thing you can taste"
          ]
        },
        icon: "fas fa-leaf"
      }
    ];

    exercisesData.forEach(exercise => {
      this.exercises.set(exercise.id, exercise);
      this.currentExerciseId = Math.max(this.currentExerciseId, exercise.id + 1);
    });
  }

  private initializeKnowledgeBase() {
    const knowledgeData: KnowledgeBase[] = [
      {
        id: 1,
        title: "Understanding Anxiety",
        content: "Anxiety is a normal human emotion that everyone experiences from time to time. It becomes problematic when it interferes with daily functioning. Common symptoms include excessive worry, restlessness, fatigue, difficulty concentrating, irritability, muscle tension, and sleep disturbances.",
        category: "anxiety",
        tags: ["anxiety", "symptoms", "mental health"],
        createdAt: new Date()
      },
      {
        id: 2,
        title: "Coping with Stress",
        content: "Stress management techniques include deep breathing exercises, regular physical activity, maintaining a healthy diet, getting adequate sleep, practicing mindfulness, setting boundaries, and seeking social support when needed.",
        category: "stress",
        tags: ["stress", "coping", "techniques"],
        createdAt: new Date()
      },
      {
        id: 3,
        title: "Signs of Burnout",
        content: "Burnout symptoms include emotional exhaustion, cynicism, reduced sense of personal accomplishment, physical symptoms like headaches and insomnia, decreased motivation, and feelings of helplessness.",
        category: "burnout",
        tags: ["burnout", "work stress", "exhaustion"],
        createdAt: new Date()
      },
      {
        id: 4,
        title: "Building Resilience",
        content: "Resilience can be developed through building strong relationships, accepting change as part of life, setting realistic goals, taking decisive action, looking for opportunities for self-discovery, nurturing a positive self-view, and keeping things in perspective.",
        category: "resilience",
        tags: ["resilience", "coping", "growth"],
        createdAt: new Date()
      }
    ];

    knowledgeData.forEach(knowledge => {
      this.knowledgeBase.set(knowledge.id, knowledge);
      this.currentKnowledgeId = Math.max(this.currentKnowledgeId, knowledge.id + 1);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const id = this.currentSessionId++;
    const session: ChatSession = { 
      ...insertSession, 
      id, 
      userId: null,
      createdAt: new Date() 
    };
    this.chatSessions.set(id, session);
    return session;
  }

  async getChatSession(id: number): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async getChatSessions(): Promise<ChatSession[]> {
    return Array.from(this.chatSessions.values());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = { 
      ...insertMessage, 
      id, 
      createdAt: new Date() 
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessagesBySession(sessionId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.sessionId === sessionId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async getExercises(): Promise<Exercise[]> {
    return Array.from(this.exercises.values());
  }

  async getExerciseById(id: number): Promise<Exercise | undefined> {
    return this.exercises.get(id);
  }

  async createMoodEntry(insertMoodEntry: InsertMoodEntry): Promise<MoodEntry> {
    const id = this.currentMoodEntryId++;
    const moodEntry: MoodEntry = { 
      ...insertMoodEntry, 
      id, 
      userId: null,
      createdAt: new Date() 
    };
    this.moodEntries.set(id, moodEntry);
    return moodEntry;
  }

  async getMoodEntriesBySession(sessionId: number): Promise<MoodEntry[]> {
    return Array.from(this.moodEntries.values())
      .filter(entry => entry.sessionId === sessionId);
  }

  async getKnowledgeBase(): Promise<KnowledgeBase[]> {
    return Array.from(this.knowledgeBase.values());
  }

  async searchKnowledgeBase(query: string): Promise<KnowledgeBase[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.knowledgeBase.values())
      .filter(kb => 
        kb.title.toLowerCase().includes(lowercaseQuery) ||
        kb.content.toLowerCase().includes(lowercaseQuery) ||
        kb.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      );
  }
}

export const storage = new MemStorage();
