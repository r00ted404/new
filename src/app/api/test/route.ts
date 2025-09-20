import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    console.log("Testing MongoDB connection...");
    const db = await getDatabase();

    if (db) {
      // Try to ping the database
      await db.admin().ping();
      console.log("MongoDB connection successful!");

      return NextResponse.json({
        status: "success",
        message: "MongoDB connection working",
        database: db.databaseName,
      });
    } else {
      console.log("Using in-memory storage fallback");
      return NextResponse.json({
        status: "fallback",
        message: "MongoDB not available, using in-memory storage",
        storage: "in-memory",
      });
    }
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return NextResponse.json(
      {
        status: "fallback",
        message: "MongoDB connection failed, using in-memory storage",
        error: error instanceof Error ? error.message : "Unknown error",
        storage: "in-memory",
      },
      { status: 200 } // Changed to 200 since fallback is working
    );
  }
}
