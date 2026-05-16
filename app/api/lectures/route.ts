import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// This ID groups your data in the database
const USER_ID = "ali_default";

/**
 * GET: Fetches the lecture counts from MongoDB
 */
export async function GET() {
  try {
    const client = await clientPromise;
    // .db() uses the database name from your URI string, 
    // but we specify it here to be safe.
    const db = client.db("lecture_tracker");
    
    const data = await db.collection("users").findOne({ userId: USER_ID });
    
    // If no data exists yet, return null so frontend uses defaults
    return NextResponse.json(data?.counts || null);
  } catch (error: any) {
    console.error("MONGODB_GET_ERROR:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch data", details: error.message }, 
      { status: 500 }
    );
  }
}

/**
 * POST: Saves the current counts to MongoDB
 */
export async function POST(request: Request) {
  try {
    const { counts } = await request.json();
    
    if (!counts) {
      return NextResponse.json({ error: "No counts provided" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("lecture_tracker");

    // updateOne with { upsert: true } will create the document if it doesn't exist
    const result = await db.collection("users").updateOne(
      { userId: USER_ID },
      { 
        $set: { 
          counts, 
          lastUpdated: new Date() 
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({ 
      success: true, 
      message: "Data synced to MongoDB",
      result 
    });
  } catch (error: any) {
    console.error("MONGODB_POST_ERROR:", error.message);
    return NextResponse.json(
      { error: "Failed to save data", details: error.message }, 
      { status: 500 }
    );
  }
}