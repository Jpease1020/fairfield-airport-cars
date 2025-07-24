import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return list of available agents
    const agents = [
      {
        id: 'content-agent',
        name: 'Content Agent',
        description: 'Manages and optimizes website content',
        status: 'active'
      },
      {
        id: 'testing-agent',
        name: 'Testing Agent',
        description: 'Runs automated tests and reports issues',
        status: 'active'
      },
      {
        id: 'fixes-agent',
        name: 'Fixes Agent',
        description: 'Automatically fixes common issues',
        status: 'active'
      },
      {
        id: 'structure-agent',
        name: 'Structure Agent',
        description: 'Analyzes and improves code structure',
        status: 'active'
      },
      {
        id: 'documentation-agent',
        name: 'Documentation Agent',
        description: 'Generates and maintains documentation',
        status: 'active'
      }
    ];

    return NextResponse.json({
      success: true,
      agents
    });
  } catch (error) {
    console.error('Error getting agents:', error);
    return NextResponse.json(
      { error: 'Failed to get agents' },
      { status: 500 }
    );
  }
} 