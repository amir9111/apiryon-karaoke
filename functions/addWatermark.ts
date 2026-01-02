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

    // טעינת התמונה המקורית
    const imageResponse = await fetch(image_url);
    const imageBuffer = await imageResponse.arrayBuffer();

    // עיבוד עם Jimp
    const image = await Jimp.read(Buffer.from(imageBuffer));
    
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    // טעינת פונט גדול יותר
    const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);

    // טקסט הלוגו - גדול ובולט
    const watermarkText = '🎤 APIRYON CLUB 🎤';
    const textWidth = Jimp.measureText(font, watermarkText);
    const textHeight = Jimp.measureTextHeight(font, watermarkText, textWidth);

    // מיקום: באמצע התחתון של התמונה
    const x = Math.floor((width - textWidth) / 2);
    const y = height - textHeight - 30;

    // הוספת רקע שחור מלא מאחורי הטקסט
    const bgPadding = 15;
    const bgColor = 0x000000FF; // שחור מלא
    
    for (let i = x - bgPadding; i < x + textWidth + bgPadding; i++) {
      for (let j = y - bgPadding; j < y + textHeight + bgPadding; j++) {
        if (i >= 0 && i < width && j >= 0 && j < height) {
          image.setPixelColor(bgColor, i, j);
        }
      }
    }

    // הוספת הטקסט בלבן
    image.print(font, x, y, watermarkText);

    // המרה ל-buffer
    const outputBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);

    // יצירת Blob והעלאה
    const blob = new Blob([outputBuffer], { type: 'image/jpeg' });
    const file = new File([blob], 'watermarked-image.jpg', { type: 'image/jpeg' });

    // העלאה לשרת
    const uploadResult = await base44.integrations.Core.UploadFile({ file });

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