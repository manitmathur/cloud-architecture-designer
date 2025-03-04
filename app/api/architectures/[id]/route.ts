// app/api/architectures/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// Define the type for the route params
type RouteContext = {
  params: {
    id: string;
  };
};

// PUT handler for a single architecture
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

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Get the architecture ID from the URL parameters
    const { id } = context.params;
    
    console.log(`GET /api/architectures/${id}: Fetching architecture`);
    
    // Connect to the database
    const { db } = await connectToDatabase();
    
    // Find the architecture with the given ID
    const architecture = await db
      .collection('architectures')
      .findOne({ _id: new ObjectId(id) });
    
    // If no architecture was found, return a 404 error
    if (!architecture) {
      console.error(`Architecture with ID ${id} not found`);
      return NextResponse.json(
        { error: 'Architecture not found' },
        { status: 404 }
      );
    }
    
    console.log(`Found architecture: ${architecture.name}`);
    
    // Return the architecture as JSON
    return NextResponse.json(architecture);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch architecture: ' + (error instanceof Error ? error.message : 'Unknown error') },
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
    const id = params.id;
    
    console.log(`DELETE /api/architectures/${id}: Deleting architecture`);
    
    // Connect to the database
    const { db } = await connectToDatabase();
    
    // Delete the architecture with the given ID
    const result = await db.collection('architectures').deleteOne(
      { _id: new ObjectId(id) }
    );
    
    // Check if anything was deleted
    if (result.deletedCount === 0) {
      console.error(`Architecture with ID ${id} not found for deletion`);
      return NextResponse.json(
        { error: 'Architecture not found' },
        { status: 404 }
      );
    }
    
    console.log(`Successfully deleted architecture with ID ${id}`);
    
    // Return a success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete architecture: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}