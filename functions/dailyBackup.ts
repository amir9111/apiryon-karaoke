import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    // שליפת כל הדאטה
    const [
      karaokeRequests,
      songs,
      messages,
      mediaUploads,
      galleryCategories,
      galleryImages,
      tableReservations,
      adminLogs
    ] = await Promise.all([
      base44.asServiceRole.entities.KaraokeRequest.list('-created_date', 1000),
      base44.asServiceRole.entities.Song.list('-created_date', 1000),
      base44.asServiceRole.entities.Message.list('-created_date', 500),
      base44.asServiceRole.entities.MediaUpload.list('-created_date', 200),
      base44.asServiceRole.entities.GalleryCategory.list('-created_date', 100),
      base44.asServiceRole.entities.GalleryImage.list('-created_date', 1000),
      base44.asServiceRole.entities.TableReservation.list('-created_date', 500),
      base44.asServiceRole.entities.AdminLog.list('-created_date', 1000)
    ]);

    const backup = {
      backup_date: new Date().toISOString(),
      version: '1.0',
      data: {
        karaokeRequests,
        songs,
        messages,
        mediaUploads,
        galleryCategories,
        galleryImages,
        tableReservations,
        adminLogs
      },
      stats: {
        total_karaoke_requests: karaokeRequests.length,
        total_songs: songs.length,
        total_messages: messages.length,
        total_media: mediaUploads.length,
        total_galleries: galleryCategories.length,
        total_gallery_images: galleryImages.length,
        total_reservations: tableReservations.length,
        total_logs: adminLogs.length
      }
    };

    // המרה ל-JSON
    const backupJson = JSON.stringify(backup, null, 2);
    const blob = new Blob([backupJson], { type: 'application/json' });
    const file = new File([blob], `apiryon-backup-${new Date().toISOString().split('T')[0]}.json`, { 
      type: 'application/json' 
    });

    // העלאה לאחסון
    const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file });

    // רישום לוג
    await base44.asServiceRole.entities.AdminLog.create({
      admin_email: user.email,
      admin_name: user.full_name,
      action_type: 'other',
      action_description: `גיבוי אוטומטי בוצע - ${backup.stats.total_karaoke_requests} בקשות, ${backup.stats.total_songs} שירים`,
      entity_type: 'Backup'
    });

    return Response.json({ 
      success: true,
      backup_url: uploadResult.file_url,
      stats: backup.stats,
      backup_date: backup.backup_date
    });

  } catch (error) {
    console.error('Backup error:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});