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

    // טעינת פונט גדול
    const font = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE);
    
    const text = 'APIRYON CLUB';
    const textWidth = Jimp.measureText(font, text);
    const textHeight = 128;

    // מיקום: מרכז התחתון
    const x = Math.floor((width - textWidth) / 2);
    const y = height - textHeight - 50;

    console.log('Adding text at:', x, y);

    // רקע שחור
    const bgPadding = 20;
    for (let i = x - bgPadding; i < x + textWidth + bgPadding; i++) {
      for (let j = y - bgPadding; j < y + textHeight + bgPadding; j++) {
        if (i >= 0 && i < width && j >= 0 && j < height) {
          image.setPixelColor(0x000000FF, i, j);
        }
      }
    }

    // הוספת טקסט לבן
    image.print(font, x, y, text);

    console.log('Watermark added successfully');

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