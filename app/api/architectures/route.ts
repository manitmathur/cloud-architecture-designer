// app/api/architectures/route.ts

import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb-handler';

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
      { error: 'Failed to fetch architectures: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Parse the request body to get the architecture data
    const { name } = await request.json();
    
    // Validate the architecture name
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    
    // Connect to the database
    const { db } = await connectToDatabase();
    
    // Create a new architecture object
    const newArchitecture = {
      name,
      components: [],
      connections: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert the new architecture into the database
    const result = await db.collection('architectures').insertOne(newArchitecture);
    
    // Return the newly created architecture with its ID
    return NextResponse.json({
      _id: result.insertedId,
      ...newArchitecture
    });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to create architecture: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}