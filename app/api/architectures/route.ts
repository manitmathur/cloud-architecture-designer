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
    // Log the entire request for debugging
    console.log('Received POST request to create architecture');

    // Parse the request body
    const body = await request.json();
    console.log('Request body:', body);

    // Validate input
    if (!body.name || typeof body.name !== 'string') {
      console.error('Invalid input: Name is required');
      return NextResponse.json(
        { error: 'Name is required and must be a string' },
        { status: 400 }
      );
    }

    // Connect to the database
    let { db } = await connectToDatabase();
    console.log('Database connection established');

    // Create a new architecture object
    const newArchitecture = {
      name: body.name,
      components: [],
      connections: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert the new architecture
    const result = await db.collection('architectures').insertOne(newArchitecture);
    console.log('Architecture inserted:', result);

    // Return the newly created architecture with its ID
    return NextResponse.json({
      _id: result.insertedId,
      ...newArchitecture
    });
  } catch (error) {
    // Log the full error details
    console.error('Complete error during architecture creation:', error);

    // Return a detailed error response
    return NextResponse.json(
      { 
        error: 'Failed to create architecture', 
        details: error instanceof Error ? error.message : 'Unknown error',
        fullError: error
      },
      { status: 500 }
    );
  }
}