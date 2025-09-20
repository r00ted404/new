"use client";

import { useState, useEffect, useCallback } from "react";

// Advanced Anti-Bot Protection System - LOOSE VERSION for real users
export class AntiBotSystem {
  constructor() {
    this.isBot = false;
    this.suspiciousActivity = 0;
    this.deviceFingerprint = null;
    this.startTime = Date.now();
    this.mouseMovements = [];
    this.keystrokes = [];
    this.clickCount = 0;
    this.scrollCount = 0;
    this.focusEvents = 0;
    this.bannedIPs = [];
    this.bannedUserAgents = [];
    this.bannedReferrers = [];
    this.whitelistedIPs = ["127.0.0.1", "::1"]; // Add your IPs here
    this.isLoose = true; // Make it loose by default
  }

  // Initialize all protection mechanisms
  async initialize() {
    await this.loadBannedLists();
    this.generateDeviceFingerprint();
    this.setupEventListeners();
    this.performInitialChecks();
    this.startBehaviorAnalysis();
    return !this.isBot;
  }

  // Load banned lists from public files (simplified)
  async loadBannedLists() {
    try {
      // Only load essential bot patterns - keep it minimal
      this.bannedUserAgents = [
        'googlebot',
        'bingbot',
        'curl',
        'wget',
        'python-requests',
        'scrapy',
        'selenium',
        'phantomjs'
      ];
      
      this.bannedIPs = [
        '66.249.', // Google bots
        '40.77.',  // Bing bots
      ];
    } catch (error) {
      console.error("Failed to load anti-bot lists:", error);
    }
  }

  // Generate unique device fingerprint
  generateDeviceFingerprint() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillText("Device fingerprint", 2, 2);

    this.deviceFingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvas.toDataURL(),
      webgl: this.getWebGLFingerprint(),
      plugins: Array.from(navigator.plugins)
        .map((p) => p.name)
        .join(","),
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: navigator.deviceMemory || "unknown",
      connection: navigator.connection
        ? navigator.connection.effectiveType
        : "unknown",
    };
  }

  // Get WebGL fingerprint
  getWebGLFingerprint() {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) return "no-webgl";

      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      return debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        : "webgl-available";
    } catch (e) {
      return "webgl-error";
    }
  }

  // Setup event listeners for behavior analysis
  setupEventListeners() {
    // Mouse movement tracking
    document.addEventListener("mousemove", (e) => {
      this.mouseMovements.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now(),
      });
      if (this.mouseMovements.length > 100) {
        this.mouseMovements = this.mouseMovements.slice(-50);
      }
    });

    // Click tracking
    document.addEventListener("click", () => {
      this.clickCount++;
    });

    // Scroll tracking
    document.addEventListener("scroll", () => {
      this.scrollCount++;
    });

    // Keystroke tracking
    document.addEventListener("keydown", () => {
      this.keystrokes.push(Date.now());
      if (this.keystrokes.length > 50) {
        this.keystrokes = this.keystrokes.slice(-25);
      }
    });

    // Focus events
    window.addEventListener("focus", () => this.focusEvents++);
    window.addEventListener("blur", () => this.focusEvents++);
  }

  // Perform initial bot checks - MADE LOOSE
  async performInitialChecks() {
    // Check user agent - only block obvious bots
    this.checkUserAgentLoose();

    // Skip IP checks for now - too restrictive
    // await this.checkIPAddress();

    // Skip referrer checks - too restrictive
    // this.checkReferrer();

    // Only check for obvious automation indicators
    this.checkAutomationIndicatorsLoose();

    // Skip browser feature checks - causes false positives
    // this.checkBrowserFeatures();

    // Skip timing attacks - too sensitive
    // this.checkTimingAttacks();
  }

  // Check user agent against banned patterns - LOOSE VERSION
  checkUserAgentLoose() {
    const userAgent = navigator.userAgent.toLowerCase();

    // Only block obvious bots, not legitimate browsers
    const obviousBotPatterns = [
      /googlebot/i,
      /bingbot/i,
      /curl/i,
      /wget/i,
      /python-requests/i,
      /scrapy/i,
      /phantomjs/i,
    ];

    if (obviousBotPatterns.some((pattern) => pattern.test(userAgent))) {
      this.suspiciousActivity += 10; // High score for obvious bots
      return;
    }

    // Be more lenient with other patterns
    const minorBotPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
    ];

    if (minorBotPatterns.some((pattern) => pattern.test(userAgent))) {
      this.suspiciousActivity += 3; // Lower score, might be false positive
    }
  }

  // Check for automation indicators - LOOSE VERSION
  checkAutomationIndicatorsLoose() {
    let automationScore = 0;

    // Check for obvious automation tools
    if (window.navigator.webdriver) automationScore += 5;
    if (window.callPhantom) automationScore += 5;
    if (window._phantom) automationScore += 5;
    
    // Be more lenient with Node.js indicators (might be legitimate)
    if (window.Buffer) automationScore += 1;
    if (window.process) automationScore += 1;
    if (window.require) automationScore += 1;

    this.suspiciousActivity += automationScore;
  }

  // Start behavior analysis - LOOSE VERSION
  startBehaviorAnalysis() {
    setTimeout(() => {
      this.analyzeBehaviorLoose();
    }, 10000); // Wait 10 seconds instead of 5

    setInterval(() => {
      this.analyzeBehaviorLoose();
    }, 60000); // Check every 60 seconds instead of 30
  }

  // Analyze user behavior patterns - LOOSE VERSION
  analyzeBehaviorLoose() {
    const timeSpent = Date.now() - this.startTime;

    // Be more lenient with behavior analysis
    // Only flag if REALLY suspicious behavior

    // Mouse movement - only flag if NO movement for very long time
    if (this.mouseMovements.length === 0 && timeSpent > 120000) { // 2 minutes
      this.suspiciousActivity += 2;
    }

    // Click patterns - only flag if NO clicks for very long time
    if (this.clickCount === 0 && timeSpent > 180000) { // 3 minutes
      this.suspiciousActivity += 1;
    }

    // Scroll behavior - only flag if NO scroll for very long time
    if (this.scrollCount === 0 && timeSpent > 240000) { // 4 minutes
      this.suspiciousActivity += 1;
    }

    // Final decision - much higher threshold
    if (this.suspiciousActivity >= 20) { // Increased from 10 to 20
      this.flagAsBot("Highly suspicious behavior pattern");
    }
  }

  // Flag as bot and take action - GENTLER APPROACH
  flagAsBot(reason) {
    this.isBot = true;
    console.log(`Bot detected: ${reason}`);
    console.log("Suspicious Activity Score:", this.suspiciousActivity);

    // Instead of immediate redirect, give a chance
    setTimeout(() => {
      if (confirm("We detected unusual activity. Are you a human user? Click OK to continue.")) {
        this.isBot = false; // Give them a second chance
        this.suspiciousActivity = 0;
        console.log("User confirmed human status - allowing access");
      } else {
        window.location.href = "https://www.google.com";
      }
    }, 2000); // Give 2 seconds instead of 1
  }

  // Get current status
  getStatus() {
    return {
      isBot: this.isBot,
      suspiciousActivity: this.suspiciousActivity,
      deviceFingerprint: this.deviceFingerprint,
    };
  }
}

// React hook for anti-bot protection - LOOSE VERSION
export const useAntiBot = () => {
  const [isProtected, setIsProtected] = useState(false);
  const [isBot, setIsBot] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    const initializeProtection = async () => {
      try {
        // Check for testing mode first
        const whitelistKey = localStorage.getItem("antibot_whitelist_key");
        if (whitelistKey === "ALLOW_TESTING_ACCESS_2024" || 
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1") {
          console.log("🧪 Testing mode or localhost - bypassing anti-bot checks");
          setIsProtected(true);
          setIsBot(false);
          setLoading(false);
          return;
        }

        const antiBot = new AntiBotSystem();
        const isLegitimate = await antiBot.initialize();

        setIsBot(!isLegitimate);
        setIsProtected(isLegitimate);
        setLoading(false);

        if (!isLegitimate) {
          console.warn("Bot detected - but being lenient");
        }
      } catch (error) {
        console.error("Anti-bot initialization failed:", error);
        // On error, allow access (be lenient)
        setIsProtected(true);
        setIsBot(false);
        setLoading(false);
      }
    };

    // Add a small delay to ensure DOM is ready
    setTimeout(initializeProtection, 100);
  }, []);

  return { isProtected, isBot, loading };
};

// Simplified protection hook - VERY LOOSE
export const useAdvancedProtection = () => {
  const [protectionActive, setProtectionActive] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Skip most advanced protections to avoid blocking real users
    // Only keep basic event listeners without blocking functionality

    const handleContextMenu = (e) => {
      // Allow right-click in loose mode
      // e.preventDefault();
      // return false;
    };

    const handleKeyDown = (e) => {
      // Allow all keyboard shortcuts in loose mode
      // if (e.key === "F12" || ...) {
      //   e.preventDefault();
      //   return false;
      // }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    setProtectionActive(true);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return protectionActive;
};


