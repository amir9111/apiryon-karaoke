import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Jimp from 'npm:jimp@0.22.10';

const LOGO_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/693c1c7149a5af7efdab4614/3870156cb_aprion-premium-logo.png';

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

    // טעינת התמונה הראשית
    const image = await Jimp.read(image_url);
    
    // טעינת הלוגו
    const logo = await Jimp.read(LOGO_URL);
    
    // שינוי גודל הלוגו - 120 פיקסלים
    logo.resize(120, 120);
    
    // התאמת שקיפות - 75%
    logo.opacity(0.75);
    
    // מיקום בפינה ימנית תחתונה
    const padding = 25;
    const xPos = image.bitmap.width - logo.bitmap.width - padding;
    const yPos = image.bitmap.height - logo.bitmap.height - padding;
    
    // הדבקת הלוגו
    image.composite(logo, xPos, yPos);

    // שמירה באיכות גבוהה
    const buffer = await image.quality(88).getBufferAsync(Jimp.MIME_JPEG);
    const blob = new Blob([buffer], { type: 'image/jpeg' });
    const file = new File([blob], 'watermarked.jpg', { type: 'image/jpeg' });

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