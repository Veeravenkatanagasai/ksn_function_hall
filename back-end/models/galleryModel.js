import db from "../config/db.js";

export const GalleryModel = {

  insertImage: async (bookingId, stage, imagePath, cloudinaryId) => {
  await db.query(
    `INSERT INTO ksn_function_hall_gallery 
     (booking_id, stage, image_path, cloudinary_id)
     VALUES (?, ?, ?, ?)`,
    [bookingId, stage, imagePath, cloudinaryId]
  );
},

  getStageWiseGallery: async (bookingId) => {
    const [rows] = await db.query(
      `SELECT gallery_id,stage, image_path
       FROM ksn_function_hall_gallery
       WHERE booking_id = ?
       ORDER BY uploaded_at DESC`,
      [bookingId]
    );
    return rows;
  },

  getImageById: async (galleryId) => {
    const [[row]] = await db.query(
      `SELECT image_path, cloudinary_id FROM ksn_function_hall_gallery WHERE gallery_id = ?`,      [galleryId]
    );
    return row;
  },

  deleteImageById: async (galleryId) => {
    await db.query(
      `DELETE FROM ksn_function_hall_gallery WHERE gallery_id = ?`,
      [galleryId]
    );
  }

};
