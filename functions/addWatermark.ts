import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Jimp from 'npm:jimp@0.22.10';

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

    // טעינת התמונה המקורית
    const imageResponse = await fetch(image_url);
    const imageBuffer = await imageResponse.arrayBuffer();

    // עיבוד עם Jimp
    const image = await Jimp.read(Buffer.from(imageBuffer));
    
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    console.log('Image size:', width, 'x', height);

    // יצירת לוגו גדול ובולט מאוד
    const logoWidth = Math.floor(width * 0.6); // 60% מרוחב התמונה
    const logoHeight = 200;
    
    // רקע ציאן בולט
    const logo = new Jimp(logoWidth, logoHeight, 0x00caffFF);
    
    // טקסט שחור גדול
    const font = await Jimp.loadFont(Jimp.FONT_SANS_128_BLACK);
    const text = 'APIRYON';
    const textWidth = Jimp.measureText(font, text);
    const textX = Math.floor((logoWidth - textWidth) / 2);
    const textY = Math.floor((logoHeight - 128) / 2);
    
    logo.print(font, textX, textY, text);

    // מיקום: באמצע התמונה
    const logoX = Math.floor((width - logoWidth) / 2);
    const logoY = Math.floor((height - logoHeight) / 2);

    console.log('Adding logo at:', logoX, logoY);

    // הדבקת הלוגו על התמונה
    image.composite(logo, logoX, logoY, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 0.9,
      opacityDest: 1.0
    });

    console.log('Logo added successfully');

    // המרה ל-buffer
    const outputBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);

    // יצירת Blob והעלאה
    const blob = new Blob([outputBuffer], { type: 'image/jpeg' });
    const file = new File([blob], `watermarked-${Date.now()}.jpg`, { type: 'image/jpeg' });

    console.log('Uploading watermarked image...');

    // העלאה לשרת
    const uploadResult = await base44.integrations.Core.UploadFile({ file });

    console.log('Upload successful:', uploadResult.file_url);

    return Response.json({ 
      success: true, 
      watermarked_url: uploadResult.file_url,
      original_url: image_url
    });

  } catch (error) {
    console.error('Watermark error:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});