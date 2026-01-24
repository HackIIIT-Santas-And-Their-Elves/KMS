// Cloudinary Configuration
// Sign up for free at https://cloudinary.com
// Get your cloud name from your Cloudinary dashboard

export const CLOUDINARY_CONFIG = {
    cloudName: 'dqyvd78vg', // Replace with your Cloudinary cloud name
    uploadPreset: 'kms_menu_images', // Create an unsigned upload preset in Cloudinary settings
};

// Cloudinary upload URL lbRtCfrAJVqN530_BA-pEHwAV-c
export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
