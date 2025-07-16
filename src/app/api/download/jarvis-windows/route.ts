import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(request: NextRequest) {
  try {
    // Path to the Jarvis Windows ZIP file
    const jarvisPath = path.join(process.cwd(), 'public', 'Jarvis-Windows.zip');
    
    // Check if file exists
    if (!fs.existsSync(jarvisPath)) {
      return NextResponse.json({ error: 'Download file not found' }, { status: 404 });
    }

    // Read the file
    const fileBuffer = fs.readFileSync(jarvisPath);
    
    // Return the file as a download
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="Jarvis-Windows.zip"',
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error serving Jarvis Windows download:', error);
    return NextResponse.json({ error: 'Failed to serve download' }, { status: 500 });
  }
} 