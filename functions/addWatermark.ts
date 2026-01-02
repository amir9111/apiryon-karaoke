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
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    // הוספת מסגרת עדינה (20px לבן עם שקיפות)
    const borderSize = 20;
    const imageWithBorder = new Jimp(width + borderSize * 2, height + borderSize * 2, 0xFFFFFFFF);
    imageWithBorder.composite(image, borderSize, borderSize);

    // יצירת לוגו + טקסט בפינה ימנית תחתונה
    const logoWidth = 300;
    const logoHeight = 120;
    const padding = 30;
    
    const logo = new Jimp(logoWidth, logoHeight, 0x00000080); // רקע שחור עם שקיפות
    
    // טקסט "APIRYON"
    const font1 = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
    logo.print(font1, 20, 15, {
      text: 'APIRYON',
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
    }, logoWidth - 40, 50);

    // טקסט "אפריון הפקות"
    const font2 = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    logo.print(font2, 20, 70, {
      text: 'אפריון הפקות',
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
    }, logoWidth - 40, 40);

    // הדבקת הלוגו בפינה ימנית תחתונה
    const xPos = imageWithBorder.bitmap.width - logoWidth - padding;
    const yPos = imageWithBorder.bitmap.height - logoHeight - padding;
    imageWithBorder.composite(logo, xPos, yPos);

    // המרה ל-Buffer
    const buffer = await imageWithBorder.getBufferAsync(Jimp.MIME_JPEG);
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