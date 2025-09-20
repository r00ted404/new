import { NextRequest, NextResponse } from "next/server";
import { getAllUserSessions, updateUserSessionStatus } from "@/lib/mongodb";

export async function GET() {
  try {
    const sessions = await getAllUserSessions();
    return NextResponse.json(sessions);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, action, rejectionReason } = body;

    console.log("🎯 Admin API called with:", {
      sessionId,
      action,
      rejectionReason,
    });

    const updates: Record<string, unknown> = {
      adminAction: action,
      updatedAt: new Date(),
    };

    if (action === "reject") {
      updates.status = "rejected";
      updates.rejectionReason = rejectionReason || "Invalid credentials";
      console.log("🔴 Setting rejection reason to:", updates.rejectionReason);
    } else {
      updates.status = "approved";
    }

    const updatedSession = await updateUserSessionStatus(sessionId, updates);
    if (!updatedSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(updatedSession);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
