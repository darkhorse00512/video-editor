import { NextRequest, NextResponse } from 'next/server';
import { processOverlaysForLambda } from '@/components/editor/version-7.0.0/utils/url-converter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Test URL conversion - Input:', JSON.stringify(body, null, 2));
    
    const processedOverlays = processOverlaysForLambda(body.overlays || []);
    
    console.log('Test URL conversion - Output:', JSON.stringify(processedOverlays, null, 2));
    
    return NextResponse.json({
      original: body.overlays,
      processed: processedOverlays,
    });
  } catch (error) {
    console.error('Test URL conversion error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
