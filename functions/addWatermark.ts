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

    // טעינת פונט
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);

    // טקסט הלוגו
    const watermarkText = 'APIRYON CLUB';
    const textWidth = Jimp.measureText(font, watermarkText);
    const textHeight = Jimp.measureTextHeight(font, watermarkText, textWidth);

    // מיקום: פינה ימנית למטה עם ריווח
    const padding = 20;
    const x = width - textWidth - padding;
    const y = height - textHeight - padding;

    // הוספת רקע שחור שקוף מאחורי הטקסט לקריאות טובה
    const bgPadding = 10;
    const bgColor = 0x000000AA; // שחור עם שקיפות
    
    for (let i = x - bgPadding; i < x + textWidth + bgPadding; i++) {
      for (let j = y - bgPadding; j < y + textHeight + bgPadding; j++) {
        if (i >= 0 && i < width && j >= 0 && j < height) {
          const currentColor = image.getPixelColor(i, j);
          const blended = Jimp.intToRGBA(currentColor);
          const bgRGBA = Jimp.intToRGBA(bgColor);
          
          // מיזוג פשוט
          blended.r = Math.round(blended.r * 0.4 + bgRGBA.r * 0.6);
          blended.g = Math.round(blended.g * 0.4 + bgRGBA.g * 0.6);
          blended.b = Math.round(blended.b * 0.4 + bgRGBA.b * 0.6);
          
          image.setPixelColor(Jimp.rgbaToInt(blended.r, blended.g, blended.b, blended.a), i, j);
        }
      }
    }

    // הוספת הטקסט
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