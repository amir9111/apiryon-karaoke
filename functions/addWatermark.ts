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

    // טעינת התמונה באיכות מקסימלית
    const image = await Jimp.read(image_url);
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    // יצירת צל עדין מסביב
    const shadowSize = 40;
    const canvas = new Jimp(width + shadowSize * 2, height + shadowSize * 2, 0x00000000);
    
    // יצירת שכבת צל
    const shadow = new Jimp(width + shadowSize, height + shadowSize, 0x00000040);
    shadow.blur(20);
    canvas.composite(shadow, shadowSize / 2, shadowSize / 2);
    
    // הדבקת התמונה המקורית
    canvas.composite(image, shadowSize, shadowSize);

    // חותמת מינימליסטית בפינה ימנית תחתונה
    const font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
    const stampText = 'APIRYON | אפריון הפקות';
    const textWidth = Jimp.measureText(font, stampText);
    
    // יצירת רקע עדין מאוד לחותמת
    const stampBg = new Jimp(textWidth + 40, 50, 0x00000030);
    stampBg.print(font, 20, 17, stampText);
    
    // הדבקת החותמת בפינה ימנית תחתונה
    const stampX = canvas.bitmap.width - textWidth - 60;
    const stampY = canvas.bitmap.height - 70;
    canvas.composite(stampBg, stampX, stampY);

    // שמירה באיכות מקסימלית (95% quality)
    const buffer = await canvas.quality(95).getBufferAsync(Jimp.MIME_JPEG);
    const blob = new Blob([buffer], { type: 'image/jpeg' });
    const file = new File([blob], 'watermarked.jpg', { type: 'image/jpeg' });

    // העלאת התמונה המעובדת
    const uploadResult = await base44.integrations.Core.UploadFile({ file });

    return Response.json({ 
      success: true, 
      watermarked_url: uploadResult.file_url,
      original_url: image_url
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ 
      error: error.message
    }, { status: 500 });
  }
});