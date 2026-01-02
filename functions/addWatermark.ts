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

    // יצירת חותמת עיגולית
    const stampSize = 140;
    const stamp = new Jimp(stampSize, stampSize, 0x00000000);
    
    // ציור עיגול עם מסגרת
    const centerX = stampSize / 2;
    const centerY = stampSize / 2;
    const radius = stampSize / 2 - 5;
    
    // מילוי עיגול (רקע שקוף מאוד)
    stamp.scan(0, 0, stampSize, stampSize, function(x, y, idx) {
      const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
      if (distance < radius) {
        this.bitmap.data[idx + 0] = 255; // R
        this.bitmap.data[idx + 1] = 255; // G
        this.bitmap.data[idx + 2] = 255; // B
        this.bitmap.data[idx + 3] = 30;  // Alpha - שקיפות מאוד
      }
      // מסגרת העיגול
      if (distance >= radius - 3 && distance <= radius) {
        this.bitmap.data[idx + 0] = 255; // R
        this.bitmap.data[idx + 1] = 255; // G
        this.bitmap.data[idx + 2] = 255; // B
        this.bitmap.data[idx + 3] = 200; // Alpha - מסגרת בולטת יותר
      }
    });
    
    // הוספת טקסט "אפריון הפקות"
    const font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
    const text1 = 'אפריון';
    const text2 = 'הפקות';
    
    // מרכוז הטקסט
    const text1Width = Jimp.measureText(font, text1);
    const text2Width = Jimp.measureText(font, text2);
    
    stamp.print(font, (stampSize - text1Width) / 2, centerY - 18, text1);
    stamp.print(font, (stampSize - text2Width) / 2, centerY + 2, text2);
    
    // הדבקת החותמת בפינה ימנית תחתונה
    const padding = 30;
    const xPos = image.bitmap.width - stampSize - padding;
    const yPos = image.bitmap.height - stampSize - padding;
    
    image.composite(stamp, xPos, yPos);

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