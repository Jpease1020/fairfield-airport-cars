import { NextResponse } from 'next/server';
import { sendSms } from '@/lib/services/twilio-service';
import { sendSupportEmail } from '@/lib/services/email-service';

export async function POST(request: Request) {
  try {
    const { name, email, phone, subject, message } = await request.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create support ticket
    const ticket = {
      id: `TICKET-${Date.now()}`,
      name,
      email,
      phone,
      subject,
      message,
      status: 'open',
      createdAt: new Date(),
      priority: subject.includes('emergency') || subject.includes('urgent') ? 'high' : 'normal'
    };

    // Send notification to admin
    const adminMessage = `New support ticket: ${subject}\nFrom: ${name} (${email})\nMessage: ${message}`;
    
    await Promise.all([
      // Send SMS to admin
      sendSms({
        to: process.env.ADMIN_PHONE || '(203) 555-0123',
        body: adminMessage
      }),
      
      // Send confirmation email to customer
      sendSupportEmail(
        email,
        'Support Ticket Received',
        `Thank you for contacting us. We've received your message about "${subject}" and will respond within 24 hours. Your ticket number is ${ticket.id}.`
      )
    ]);

    return NextResponse.json({ 
      success: true, 
      ticketId: ticket.id,
      message: 'Support ticket created successfully' 
    });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create support ticket' },
      { status: 500 }
    );
  }
} 