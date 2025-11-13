import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

/**
 * Verify email service configuration without sending an email
 * This helps diagnose configuration issues
 */
export async function GET(request: NextRequest) {
  try {
    const {
      EMAIL_HOST,
      EMAIL_PORT,
      EMAIL_USER,
      EMAIL_PASS,
    } = process.env;

    const config = {
      EMAIL_HOST: EMAIL_HOST ? '✅ Set' : '❌ Missing',
      EMAIL_PORT: EMAIL_PORT ? `✅ Set (${EMAIL_PORT})` : '❌ Missing',
      EMAIL_USER: EMAIL_USER ? `✅ Set (${EMAIL_USER.substring(0, 3)}***)` : '❌ Missing',
      EMAIL_PASS: EMAIL_PASS ? `✅ Set (${EMAIL_PASS.length} chars)` : '❌ Missing',
    };

    // Try to create transporter and verify connection
    let transporterStatus = 'Not tested';
    let connectionTest = null;

    if (EMAIL_HOST && EMAIL_PORT && EMAIL_USER && EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: EMAIL_HOST,
          port: Number(EMAIL_PORT),
          secure: Number(EMAIL_PORT) === 465,
          auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS,
          },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 10000,
          ...(EMAIL_HOST === 'smtp.gmail.com' && {
            service: 'gmail',
            tls: {
              rejectUnauthorized: false,
            },
          }),
        });
        
        transporterStatus = '✅ Transporter created successfully';
        
        // Try to verify connection (without sending email)
        try {
          await transporter.verify();
          connectionTest = {
            status: 'success',
            message: 'SMTP connection verified successfully'
          };
        } catch (verifyError) {
          connectionTest = {
            status: 'failed',
            message: verifyError instanceof Error ? verifyError.message : String(verifyError),
            error: verifyError instanceof Error ? {
              name: verifyError.name,
              code: (verifyError as any).code,
              command: (verifyError as any).command,
            } : null
          };
        }
      } catch (transporterError) {
        transporterStatus = `❌ Failed: ${transporterError instanceof Error ? transporterError.message : String(transporterError)}`;
      }
    }

    return NextResponse.json({
      status: 'ok',
      config,
      transporterStatus,
      connectionTest,
      recommendations: !EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS
        ? ['Set all EMAIL_* environment variables in Vercel']
        : connectionTest?.status === 'failed'
        ? [
            'SMTP connection failed - check credentials',
            'If using Gmail, ensure you\'re using an App Password (not regular password)',
            'Check Google Account security for blocked access attempts',
            'Verify EMAIL_HOST and EMAIL_PORT are correct for your email provider',
            'If it worked yesterday, Google may have temporarily blocked access - wait 15-30 minutes and try again'
          ]
        : ['Email service configuration looks good']
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

