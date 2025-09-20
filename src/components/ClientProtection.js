"use client";

import { useEffect, useState } from "react";
import { AntiBotSystem } from "../lib/antibot";

export default function ClientProtection({ children }) {
  const [isClient, setIsClient] = useState(false);
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const checkAccess = async () => {
      try {
        // Check localStorage whitelist key first (for testing)
        const whitelistKey = localStorage.getItem("antibot_whitelist_key");
        if (whitelistKey === "ALLOW_TESTING_ACCESS_2024") {
          console.log(
            "🧪 Testing mode enabled - bypassing all anti-bot checks"
          );
          setIsWhitelisted(true);
          setLoading(false);
          return;
        }

        // Auto-enable testing mode for localhost
        if (
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1"
        ) {
          console.log("🏠 Localhost detected - enabling testing mode");
          localStorage.setItem(
            "antibot_whitelist_key",
            "ALLOW_TESTING_ACCESS_2024"
          );
          setIsWhitelisted(true);
          setLoading(false);
          return;
        }

        // Initialize LOOSE anti-bot system
        const antiBot = new AntiBotSystem();
        const isLegitimate = await antiBot.initialize();

        if (!isLegitimate) {
          // Be more lenient - don't immediately block
          console.warn("Potential bot detected, but being lenient");

          // Give user a chance instead of immediate redirect
          const userConfirmed = confirm(
            "We detected unusual activity. Are you a human user? Click OK to continue."
          );
          if (userConfirmed) {
            console.log("User confirmed human status - allowing access");
            setLoading(false);
            return;
          } else {
            setIsBlocked(true);
            setTimeout(() => {
              window.location.href = "https://www.google.com";
            }, 3000); // Longer delay
            return;
          }
        }

        // Perform additional checks but be very lenient
        await performLenientChecks();
        setLoading(false);
      } catch (error) {
        console.error("Protection check failed:", error);
        // On error, allow access (be lenient)
        console.log(
          "Error occurred, allowing access to avoid blocking real users"
        );
        setLoading(false);
      }
    };

    // Very lenient checks
    const performLenientChecks = async () => {
      // Only check for the most obvious automation tools
      if (window.navigator.webdriver || window.callPhantom || window._phantom) {
        console.warn("Obvious automation tool detected");
        // Even here, give a chance
        const userConfirmed = confirm(
          "Automation tool detected. Are you testing? Click OK if you're a human."
        );
        if (!userConfirmed) {
          setIsBlocked(true);
          setTimeout(() => {
            window.location.href = "https://www.google.com";
          }, 3000);
          return;
        }
      }

      // Skip user agent checks - too many false positives
      // Skip screen dimension checks - too restrictive
      // Skip timing checks - too sensitive
    };

    checkAccess();
  }, [isClient]);

  // Don't render anything during SSR
  if (!isClient) {
    return children;
  }

  // Show loading during security checks
  if (loading && !isWhitelisted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing security...</p>
          <p className="text-xs text-gray-400 mt-2">
            This should only take a moment
          </p>
        </div>
      </div>
    );
  }

  // Show blocked message (should rarely be seen due to lenient approach)
  if (isBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🤖</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Automated Access Detected
          </h1>
          <p className="text-gray-700 mb-4">
            We detected automated behavior. Redirecting to Google in 3
            seconds...
          </p>
          <p className="text-xs text-gray-500 mb-4">
            If you&apos;re a human user, please try refreshing the page.
          </p>
          <div className="animate-spin w-6 h-6 border-4 border-red-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  // Render content
  return <>{children}</>;
}
