import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Define specialized agents for Fairfield Airport Cars
    const agents = [
      {
        name: 'Booking Specialist',
        role: 'Booking system optimization, customer journey improvement, form validation',
        capabilities: ['booking flow', 'customer experience', 'form validation', 'user testing'],
        currentTasks: 0,
        model: 'gpt-4o',
        focus: 'booking-system'
      },
      {
        name: 'Payment Engineer',
        role: 'Payment processing, Square integration, webhook handling, refund management',
        capabilities: ['payment processing', 'square integration', 'webhooks', 'security'],
        currentTasks: 0,
        model: 'gpt-4o',
        focus: 'payment-system'
      },
      {
        name: 'Communication Manager',
        role: 'Email/SMS notifications, template management, automated messaging',
        capabilities: ['email service', 'sms notifications', 'templates', 'automation'],
        currentTasks: 0,
        model: 'gpt-4o',
        focus: 'communication-system'
      },
      {
        name: 'Admin Dashboard Developer',
        role: 'Admin interface, booking management, analytics, reporting',
        capabilities: ['admin dashboard', 'booking management', 'analytics', 'reporting'],
        currentTasks: 0,
        model: 'gpt-4o',
        focus: 'admin-dashboard'
      },
      {
        name: 'QA Tester',
        role: 'End-to-end testing, customer journey validation, bug identification',
        capabilities: ['testing', 'customer journey', 'bug detection', 'quality assurance'],
        currentTasks: 0,
        model: 'gpt-4o-mini',
        focus: 'testing'
      },
      {
        name: 'Business Analyst',
        role: 'Business process optimization, cost analysis, performance metrics',
        capabilities: ['business analysis', 'cost tracking', 'metrics', 'optimization'],
        currentTasks: 0,
        model: 'gpt-4o-mini',
        focus: 'business-analysis'
      }
    ];

    return NextResponse.json({
      agents: agents,
      total: agents.length,
      project: 'Fairfield Airport Cars',
      description: 'Specialized agents for car service booking platform development'
    });

  } catch (error) {
    console.error('Agents GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 