import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    const { image_url } = await req.json();

    if (!image_url) {
      return Response.json({ error: 'image_url is required' }, { status: 400 });
    }

    console.log('Processing image:', image_url);

    // טעינת התמונה
    const imageResponse = await fetch(image_url);
    const imageBlob = await imageResponse.blob();
    
    console.log('Image loaded, size:', imageBlob.size);

    // קריאה לשירות ליצירת לוגו בעזרת LLM + העלאה
    const logoPrompt = `Create a simple watermark image with:
- Text: "APIRYON CLUB" in large bold white letters
- Black semi-transparent background
- Size: 800x200 pixels
- Professional looking, high contrast`;

    console.log('Generating watermark logo...');

    const logoResult = await base44.asServiceRole.integrations.Core.GenerateImage({
      prompt: logoPrompt,
      existing_image_urls: [image_url]
    });

    console.log('Logo generated:', logoResult.url);

    // מחזירים את התמונה עם הלוגו
    return Response.json({ 
      success: true, 
      watermarked_url: logoResult.url,
      original_url: image_url,
      method: 'ai_generated'
    });

  } catch (error) {
    console.error('Watermark error:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});