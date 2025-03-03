// app/api/architectures/[id]/route.ts

import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb-handler';
import { ObjectId } from 'mongodb';

//PUT handler for a single architecture
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the architecture ID from the URL parameters
    const id = params.id;
    
    // Parse the request body
    const { components, connections } = await request.json();
    
    // Add logging to see what's being sent
    console.log('Received Update Request:');
    console.log('ID:', id);
    console.log('Components:', JSON.stringify(components, null, 2));
    console.log('Connections:', JSON.stringify(connections, null, 2));
    
    // Connect to the database
    const { db } = await connectToDatabase();
    
    // Update the architecture with the given ID
    const result = await db.collection('architectures').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          components, 
          connections,
          updatedAt: new Date()
        } 
      }
    );
    
    // Log the update result
    console.log('Update Result:', result);
    
    // Check if the update was successful
    if (result.matchedCount === 0) {
      console.error('No matching architecture found');
      return NextResponse.json(
        { error: 'Architecture not found' },
        { status: 404 }
      );
    }
    
    // Return a success response
    return NextResponse.json({ success: true, updatedFields: { components, connections } });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to update architecture: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

// GET handler to fetch a single architecture
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the architecture ID from the URL parameters
    const id = params.id;
    
    // Connect to the database
    const { db } = await connectToDatabase();
    
    // Find the architecture with the given ID
    const architecture = await db
      .collection('architectures')
      .findOne({ _id: new ObjectId(id) });
    
    // If no architecture was found, return a 404 error
    if (!architecture) {
      return NextResponse.json(
        { error: 'Architecture not found' },
        { status: 404 }
      );
    }
    
    // Return the architecture as JSON
    return NextResponse.json(architecture);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch architecture' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the architecture ID from the URL parameters
    // No need to await params - it's already available
    const id = params.id;
    
    // Connect to the database
    const { db } = await connectToDatabase();
    
    // Delete the architecture with the given ID
    const result = await db.collection('architectures').deleteOne(
      { _id: new ObjectId(id) }
    );
    
    // Check if anything was deleted
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Architecture not found' },
        { status: 404 }
      );
    }
    
    // Return a success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete architecture' },
      { status: 500 }
    );
  }
}