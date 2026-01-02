import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Jimp from 'npm:jimp@0.22.10';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    // שליפת כל התמונות
    const allImages = await base44.asServiceRole.entities.GalleryImage.list('-created_date', 1000);
    
    let processedCount = 0;
    let skippedCount = 0;
    const errors = [];

    for (const image of allImages) {
      try {
        // דילוג על תמונות שכבר עובדו
        if (image.image_url.includes('watermarked-')) {
          skippedCount++;
          continue;
        }

        // טעינת התמונה
        const imageResponse = await fetch(image.image_url);
        const imageBuffer = await imageResponse.arrayBuffer();
        const jimpImage = await Jimp.read(Buffer.from(imageBuffer));
        
        const width = jimpImage.bitmap.width;
        const height = jimpImage.bitmap.height;

        // טעינת פונט
        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);

        // טקסט הלוגו
        const watermarkText = 'APIRYON CLUB';
        const textWidth = Jimp.measureText(font, watermarkText);
        const textHeight = Jimp.measureTextHeight(font, watermarkText, textWidth);

        // מיקום: פינה ימנית למטה
        const padding = 20;
        const x = width - textWidth - padding;
        const y = height - textHeight - padding;

        // רקע שחור שקוף
        const bgPadding = 10;
        const bgColor = 0x000000AA;
        
        for (let i = x - bgPadding; i < x + textWidth + bgPadding; i++) {
          for (let j = y - bgPadding; j < y + textHeight + bgPadding; j++) {
            if (i >= 0 && i < width && j >= 0 && j < height) {
              const currentColor = jimpImage.getPixelColor(i, j);
              const blended = Jimp.intToRGBA(currentColor);
              const bgRGBA = Jimp.intToRGBA(bgColor);
              
              blended.r = Math.round(blended.r * 0.4 + bgRGBA.r * 0.6);
              blended.g = Math.round(blended.g * 0.4 + bgRGBA.g * 0.6);
              blended.b = Math.round(blended.b * 0.4 + bgRGBA.b * 0.6);
              
              jimpImage.setPixelColor(Jimp.rgbaToInt(blended.r, blended.g, blended.b, blended.a), i, j);
            }
          }
        }

        // הוספת הטקסט
        jimpImage.print(font, x, y, watermarkText);

        // המרה ל-buffer
        const outputBuffer = await jimpImage.getBufferAsync(Jimp.MIME_JPEG);

        // יצירת Blob והעלאה
        const blob = new Blob([outputBuffer], { type: 'image/jpeg' });
        const file = new File([blob], `watermarked-${image.original_filename || 'image.jpg'}`, { type: 'image/jpeg' });

        // העלאה
        const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file });

        // עדכון התמונה בדאטהבייס
        await base44.asServiceRole.entities.GalleryImage.update(image.id, {
          image_url: uploadResult.file_url,
          thumbnail_url: uploadResult.file_url
        });

        processedCount++;

      } catch (error) {
        errors.push({
          image_id: image.id,
          error: error.message
        });
      }
    }

    return Response.json({ 
      success: true,
      total: allImages.length,
      processed: processedCount,
      skipped: skippedCount,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Batch watermark error:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});