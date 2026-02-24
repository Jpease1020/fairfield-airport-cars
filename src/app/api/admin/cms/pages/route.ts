import { NextRequest, NextResponse } from 'next/server';
import { cmsFlattenedService } from '@/lib/services/cms-service';
import { requireAdmin } from '@/lib/utils/auth-server';

// GET - Fetch CMS data for a specific page or all pages
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.ok) return authResult.response;

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');

    if (page === 'all') {
      // Get all CMS data
      const allData = await cmsFlattenedService.getAllCMSData();
      return NextResponse.json(allData);
    } else if (page) {
      // Get specific page data
      const pageData = await cmsFlattenedService.getPageContent(page);
      return NextResponse.json(pageData);
    } else {
      return NextResponse.json({ error: 'Page parameter required' }, { status: 400 });
    }
  } catch (error) {
    console.error('CMS API Error:', error);
    return NextResponse.json({ error: 'Failed to load CMS data' }, { status: 500 });
  }
}

// POST - Seed/Update entire page data
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.ok) return authResult.response;

    const body = await request.json();
    const { page, data } = body;

    if (!page || !data) {
      return NextResponse.json({ error: 'page and data required' }, { status: 400 });
    }

    // Update the entire page data in Firebase
    await cmsFlattenedService.updatePageContent(page, data);

    return NextResponse.json({ success: true, message: `Page ${page} updated successfully` });
  } catch (error) {
    console.error('CMS Seeding Error:', error);
    return NextResponse.json({ error: 'Failed to seed page data' }, { status: 500 });
  }
}

// PUT - Update a CMS field
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.ok) return authResult.response;

    const body = await request.json();
    const { fieldPath, value } = body;

    if (!fieldPath || value === undefined) {
      return NextResponse.json({ error: 'fieldPath and value required' }, { status: 400 });
    }

    // Update the field in Firebase
    await cmsFlattenedService.updateField(fieldPath, value);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('CMS Update Error:', error);
    return NextResponse.json({ error: 'Failed to update field' }, { status: 500 });
  }
}
