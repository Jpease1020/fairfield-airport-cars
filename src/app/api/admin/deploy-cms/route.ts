import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'fairfield-airport-car-service'
  });
}

const db = admin.firestore();

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting CMS data deployment to production...');
    
    // Read the cleaned data
    const cleanedDataPath = path.join(process.cwd(), 'temp', 'cleaned-emulator-cms-data.json');
    const cleanedData = JSON.parse(fs.readFileSync(cleanedDataPath, 'utf8'));
    
    console.log(`📊 Found ${Object.keys(cleanedData).length} CMS documents to deploy`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    
    for (const [docId, data] of Object.entries(cleanedData)) {
      try {
        console.log(`📄 Deploying ${docId}...`);
        
        // Set the document in production Firestore
        await db.collection('cms').doc(docId).set(data as any);
        
        console.log(`  ✅ ${docId} deployed successfully`);
        successCount++;
      } catch (error) {
        const errorMsg = `Error deploying ${docId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.log(`  ❌ ${errorMsg}`);
        errors.push(errorMsg);
        errorCount++;
      }
    }
    
    console.log('\n📊 Deployment Summary:');
    console.log(`✅ Successfully deployed: ${successCount} documents`);
    console.log(`❌ Failed to deploy: ${errorCount} documents`);
    
    if (successCount > 0) {
      console.log('\n🎉 CMS data deployment completed!');
    }
    
    return NextResponse.json({
      success: true,
      message: 'CMS data deployment completed',
      summary: {
        total: Object.keys(cleanedData).length,
        successful: successCount,
        failed: errorCount,
        errors: errors
      }
    });
    
  } catch (error) {
    console.error('❌ CMS deployment failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
