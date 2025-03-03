import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb-handler';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const architectures = await db
      .collection('architectures')
      .find({})
      .toArray();
    return NextResponse.json(architectures);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch architectures' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    const { db } = await connectToDatabase();
    
    const newArchitecture = {
      name,
      components: [],
      connections: [],
      createdAt: new Date()
    };
    
    const result = await db.collection('architectures').insertOne(newArchitecture);
    
    return NextResponse.json({
      _id: result.insertedId,
      ...newArchitecture
    });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to create architecture' },
      { status: 500 }
    );
  }
}