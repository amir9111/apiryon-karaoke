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

    // יצירת לוגו APIRYON ויזואלי
    const logoWidth = Math.min(600, Math.floor(width * 0.4)); // 40% מרוחב התמונה
    const logoHeight = 150;
    
    // יצירת תמונת לוגו עם רקע
    const logo = new Jimp(logoWidth, logoHeight, 0x000000E6); // רקע שחור עם שקיפות
    
    // מסגרת בצבע ציאן
    const borderColor = 0x00caffFF;
    const borderWidth = 8;
    
    // מסגרת עליונה
    for (let x = 0; x < logoWidth; x++) {
      for (let y = 0; y < borderWidth; y++) {
        logo.setPixelColor(borderColor, x, y);
      }
    }
    // מסגרת תחתונה
    for (let x = 0; x < logoWidth; x++) {
      for (let y = logoHeight - borderWidth; y < logoHeight; y++) {
        logo.setPixelColor(borderColor, x, y);
      }
    }
    // מסגרת שמאלית
    for (let x = 0; x < borderWidth; x++) {
      for (let y = 0; y < logoHeight; y++) {
        logo.setPixelColor(borderColor, x, y);
      }
    }
    // מסגרת ימנית
    for (let x = logoWidth - borderWidth; x < logoWidth; x++) {
      for (let y = 0; y < logoHeight; y++) {
        logo.setPixelColor(borderColor, x, y);
      }
    }

    // הוספת טקסט ללוגו
    const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
    const text = 'APIRYON';
    const textWidth = Jimp.measureText(font, text);
    const textX = Math.floor((logoWidth - textWidth) / 2);
    const textY = Math.floor((logoHeight - 64) / 2);
    
    logo.print(font, textX, textY, text);

    // הוספת טקסט קטן יותר מתחת
    const smallFont = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    const subText = 'CLUB';
    const subTextWidth = Jimp.measureText(smallFont, subText);
    const subTextX = Math.floor((logoWidth - subTextWidth) / 2);
    const subTextY = textY + 70;
    
    logo.print(smallFont, subTextX, subTextY, subText);

    // מיקום הלוגו: מרכז התחתון
    const logoX = Math.floor((width - logoWidth) / 2);
    const logoY = height - logoHeight - 40;

    // הדבקת הלוגו על התמונה
    image.composite(logo, logoX, logoY, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 0.95,
      opacityDest: 1.0
    });

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