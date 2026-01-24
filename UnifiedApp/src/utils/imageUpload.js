import { CLOUDINARY_CONFIG, CLOUDINARY_UPLOAD_URL } from '../config/cloudinary';

/**
 * Upload an image to Cloudinary
 * @param {string} imageUri - Local URI of the image
 * @returns {Promise<string>} - URL of the uploaded image
 */
export const uploadImageToCloudinary = async (imageUri) => {
    try {
        // Create form data
        const formData = new FormData();
        
        // Get file extension
        const uriParts = imageUri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        formData.append('file', {
            uri: imageUri,
            type: `image/${fileType}`,
            name: `menu_image_${Date.now()}.${fileType}`,
        });
        formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
        formData.append('folder', 'kms_menu'); // Optional: organize images in a folder
        
        console.log('📤 Uploading image to Cloudinary...');
        
        const response = await fetch(CLOUDINARY_UPLOAD_URL, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data',
            },
        });
        
        const data = await response.json();
        
        if (data.error) {
            console.error('❌ Cloudinary upload error:', data.error);
            throw new Error(data.error.message || 'Failed to upload image');
        }
        
        console.log('✅ Image uploaded successfully:', data.secure_url);
        return data.secure_url;
    } catch (error) {
        console.error('❌ Upload error:', error);
        throw error;
    }
};

/**
 * Delete an image from Cloudinary (requires backend implementation)
 * Note: For security, deletion should be done via backend
 */
export const deleteImageFromCloudinary = async (publicId) => {
    // This would require backend implementation with API secret
    console.log('Image deletion requires backend implementation');
};
