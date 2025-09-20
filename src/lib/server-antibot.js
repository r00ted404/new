// Server-side Anti-Bot Protection for API Routes - LOOSE VERSION
// Lenient approach to avoid blocking real users

export class ServerAntiBotSystem {
  constructor() {
    // Only the most obvious bot patterns
    this.bannedUserAgents = [
      // Search Engine Bots (major ones only)
      /googlebot/i,
      /bingbot/i,
      /slurp/i,
      /baiduspider/i,
      /yandexbot/i,

      // Obvious HTTP Clients
      /curl/i,
      /wget/i,
      /python-requests/i,
      /scrapy/i,

      // Automation Tools (obvious ones)
      /selenium/i,
      /webdriver/i,
      /puppeteer/i,
      /playwright/i,
      /phantomjs/i,

      // Only obvious bot patterns, not generic ones
      /bot$/i, // Only if it ends with 'bot'
      /crawler$/i, // Only if it ends with 'crawler'
      /spider$/i, // Only if it ends with 'spider'
    ];

    // Only block known problematic IP ranges
    this.bannedIPs = [
      "66.249.", // Google bot range
      "40.77.", // Bing bot range
      "157.55.", // Bing bot range
      // Don't block VPN/proxy ranges - too restrictive
    ];

    // Whitelist common development/testing IPs
    this.whitelistedIPs = [
      "127.0.0.1",
      "::1",
      "localhost",
      // Add your development IPs here
    ];
  }

  // Main validation function for API routes - LOOSE VERSION
  validateRequest(request) {
    const userAgent = request.headers.get("user-agent") || "";
    const ip = this.getClientIP(request);

    // Always allow whitelisted IPs
    if (this.whitelistedIPs.includes(ip)) {
      return {
        isBot: false,
        reason: "Whitelisted IP",
        action: "allow",
      };
    }

    // Check for obvious bots only
    if (this.isObviousBot(userAgent)) {
      return {
        isBot: true,
        reason: "Obvious bot user agent detected",
        action: "block",
      };
    }

    // Check for banned IPs (very specific ranges only)
    if (this.isBannedIP(ip)) {
      return {
        isBot: true,
        reason: "Known bot IP range",
        action: "block",
      };
    }

    // Skip most other checks to avoid false positives
    // - Skip referer checks (too restrictive)
    // - Skip automation headers (too many false positives)
    // - Skip missing headers check (legitimate apps might not have them)

    return {
      isBot: false,
      reason: "Legitimate request",
      action: "allow",
    };
  }

  // Extract client IP from request
  getClientIP(request) {
    // Try various headers for IP detection
    const headers = [
      "cf-connecting-ip", // Cloudflare
      "x-forwarded-for",
      "x-real-ip",
      "x-cluster-client-ip",
      "x-forwarded",
      "forwarded-for",
      "forwarded",
    ];

    for (const header of headers) {
      const value = request.headers.get(header);
      if (value) {
        // Take first IP if comma-separated
        return value.split(",")[0].trim();
      }
    }

    return "unknown";
  }

  // Check if user agent indicates an obvious bot - VERY SPECIFIC
  isObviousBot(userAgent) {
    if (!userAgent || userAgent.length < 5) {
      return true; // Too short or missing
    }

    // Allow Telegram webhooks and similar legitimate services
    if (
      userAgent.toLowerCase().includes("telegram") ||
      userAgent.toLowerCase().includes("tgbotapi") ||
      userAgent.toLowerCase().includes("webhook") ||
      userAgent.toLowerCase().includes("api")
    ) {
      return false; // Allow these
    }

    // Only check against very specific bot patterns
    const obviousBotPatterns = [
      /^googlebot/i,
      /^bingbot/i,
      /^curl\//i,
      /^wget\//i,
      /^python-requests/i,
      /^scrapy/i,
      /^selenium/i,
      /^phantomjs/i,
    ];

    return obviousBotPatterns.some((pattern) => pattern.test(userAgent));
  }

  // Check if IP is in known bot ranges - VERY SPECIFIC
  isBannedIP(ip) {
    if (!ip || ip === "unknown") {
      return false; // Don't block unknown IPs
    }

    // Only block very specific known bot IP ranges
    return this.bannedIPs.some((bannedIP) => ip.startsWith(bannedIP));
  }

  // Generate a gentle error response for blocked requests
  generateBlockResponse() {
    return new Response(
      JSON.stringify({
        error: "Request temporarily unavailable",
        message: "Please try again in a moment",
        code: "RATE_LIMITED",
      }),
      {
        status: 429, // Use 429 instead of 503 to be less harsh
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Retry-After": "60", // Suggest retry after 60 seconds
        },
      }
    );
  }

  // Log blocked request (for monitoring) - LESS VERBOSE
  logBlockedRequest(request, reason) {
    const logData = {
      timestamp: new Date().toISOString(),
      ip: this.getClientIP(request),
      userAgent: request.headers.get("user-agent"),
      url: request.url,
      method: request.method,
      reason: reason,
    };

    console.log("🚫 BLOCKED REQUEST:", JSON.stringify(logData, null, 2));
  }
}

// Middleware function for API routes - LOOSE VERSION
export function withServerAntiBotProtection(handler) {
  return async (request) => {
    const antiBot = new ServerAntiBotSystem();
    const validation = antiBot.validateRequest(request);

    if (validation.isBot) {
      antiBot.logBlockedRequest(request, validation.reason);
      return antiBot.generateBlockResponse();
    }

    // Call the original handler if validation passes
    return handler(request);
  };
}

// Quick validation function for simple checks
export function isRequestFromBot(request) {
  const antiBot = new ServerAntiBotSystem();
  const validation = antiBot.validateRequest(request);
  return validation.isBot;
}
