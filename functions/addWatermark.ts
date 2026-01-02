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

    // טעינת התמונה
    const image = await Jimp.read(image_url);

    // חותמת פשוטה בפינה ימנית תחתונה
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    const stampText = 'APIRYON';
    
    // הוספת טקסט עם אפקט צל (הדפסה כפולה)
    const padding = 40;
    const xPos = image.bitmap.width - Jimp.measureText(font, stampText) - padding;
    const yPos = image.bitmap.height - 70;
    
    // צל (שחור עם שקיפות)
    image.print(font, xPos + 2, yPos + 2, {
      text: stampText,
      alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT
    });
    
    // טקסט לבן
    image.opacity(0.7);
    const overlay = image.clone();
    overlay.opacity(1.0);
    overlay.print(font, xPos, yPos, {
      text: stampText,
      alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT
    });
    
    image.composite(overlay, 0, 0);

    // שמירה באיכות גבוהה
    const buffer = await image.quality(90).getBufferAsync(Jimp.MIME_JPEG);
    const blob = new Blob([buffer], { type: 'image/jpeg' });
    const file = new File([blob], 'watermarked.jpg', { type: 'image/jpeg' });

    // העלאה
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