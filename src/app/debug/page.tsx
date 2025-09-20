"use client";

import { useState } from "react";

export default function DebugPage() {
  const [result, setResult] = useState("");

  const testAPI = async () => {
    try {
      const response = await fetch("/api/test", {
        method: "POST",
      });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult("Error: " + error);
    }
  };

  const testSessionAPI = async () => {
    try {
      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          email: "test@example.com",
          password: "test123",
        }),
      });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult("Error: " + error);
    }
  };

  return (
    <div className="p-8 bg-black text-white min-h-screen">
      <h1 className="text-2xl mb-4">API Debug Page</h1>

      <div className="space-y-4">
        <button
          onClick={testAPI}
          className="px-4 py-2 bg-blue-600 rounded mr-4"
        >
          Test Basic API
        </button>

        <button
          onClick={testSessionAPI}
          className="px-4 py-2 bg-green-600 rounded"
        >
          Test Session API
        </button>
      </div>

      <pre className="mt-4 p-4 bg-gray-800 rounded overflow-auto">{result}</pre>
    </div>
  );
}


