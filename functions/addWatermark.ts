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
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    
    const padding = 40;
    const xPos = image.bitmap.width - 180;
    const yPos = image.bitmap.height - 90;
    
    // צל שחור
    image.print(font, xPos + 3, yPos + 3, {
      text: 'אפריון',
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
    }, 150);
    
    image.print(font, xPos + 3, yPos + 38, {
      text: 'הפקות',
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
    }, 150);
    
    // טקסט לבן
    image.print(font, xPos, yPos, {
      text: 'אפריון',
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
    }, 150);
    
    image.print(font, xPos, yPos + 35, {
      text: 'הפקות',
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
    }, 150);

    // שמירה
    const buffer = await image.quality(85).getBufferAsync(Jimp.MIME_JPEG);
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