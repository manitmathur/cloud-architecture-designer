// app/api/architectures/route.ts

import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../lib/mongodb-handler';

/**
 * GET handler for /api/architectures
 * Retrieves all architectures from the database
 */
export async function GET() {
  try {
    // Connect to the database
    const { db } = await connectToDatabase();
    
    // Fetch all architectures sorted by creation date (newest first)
    const architectures = await db
      .collection('architectures')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    // Return the architectures as JSON
  
    return NextResponse.json(architectures);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch architectures' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for /api/architectures
 * Creates a new architectures in the database
 */
export async function POST(request: Request) {
  try {
    // Parse the request body to get the architectures data
    const { name } = await request.json();
    
    // Validate the architectures name
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    
    // Connect to the database
    const { db } = await connectToDatabase();
    
    // Create a new architectures object
    const newArchitectures = {
      name,
      components: [],
      connections: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert the new application into the database
    const result = await db.collection('architectures').insertOne(newArchitectures);
    
    // Return the newly created application with its ID
    return NextResponse.json({
      _id: result.insertedId,
      ...newArchitectures
    });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to create architectures' },
      { status: 500 }
    );
  }
}