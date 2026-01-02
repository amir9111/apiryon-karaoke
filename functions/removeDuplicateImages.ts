import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    const { gallery_id } = await req.json();

    if (!gallery_id) {
      return Response.json({ error: 'gallery_id is required' }, { status: 400 });
    }

    // שליפת כל התמונות של הגלריה
    const allImages = await base44.asServiceRole.entities.GalleryImage.filter({ gallery_id }, 'created_date', 500);

    // מציאת כפילויות לפי original_filename
    const seen = new Map();
    const toDelete = [];

    for (const image of allImages) {
      const filename = image.original_filename;
      
      if (seen.has(filename)) {
        // זו כפילות - נוסיף למחיקה
        toDelete.push(image.id);
      } else {
        // זו התמונה הראשונה עם השם הזה - נשמור
        seen.set(filename, image.id);
      }
    }

    // מחיקת הכפילויות
    let deleted = 0;
    for (const imageId of toDelete) {
      try {
        await base44.asServiceRole.entities.GalleryImage.delete(imageId);
        deleted++;
      } catch (err) {
        console.error('Failed to delete image:', imageId, err);
      }
    }

    // תיעוד בלוג
    await base44.asServiceRole.entities.AdminLog.create({
      admin_email: user.email,
      admin_name: user.full_name,
      action_type: 'delete',
      action_description: `הוסרו ${deleted} תמונות כפולות מגלריה ${gallery_id}`,
      entity_type: 'GalleryImage'
    });

    return Response.json({ 
      success: true,
      total_images: allImages.length,
      duplicates_removed: deleted,
      remaining_images: allImages.length - deleted
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});