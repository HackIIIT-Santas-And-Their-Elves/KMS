# Setting Up Cloudinary for Image Upload

## Step 1: Create a Free Cloudinary Account

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Click **Sign Up for Free**
3. Fill in your details and create an account

## Step 2: Get Your Cloud Name

1. After signing in, go to your **Dashboard**
2. You'll see your **Cloud Name** at the top (e.g., `dxxxxxxxx`)
3. Copy this cloud name

## Step 3: Create an Upload Preset

1. Go to **Settings** → **Upload** → **Upload presets**
2. Click **Add upload preset**
3. Set these options:
   - **Preset name**: `kms_menu_images`
   - **Signing Mode**: `Unsigned` (required for client-side uploads)
   - **Folder**: `kms_menu` (optional, for organization)
4. Click **Save**

## Step 4: Configure the App

1. Open `UnifiedApp/src/config/cloudinary.js`
2. Replace `YOUR_CLOUD_NAME` with your actual cloud name:

```javascript
export const CLOUDINARY_CONFIG = {
    cloudName: 'your-actual-cloud-name', // e.g., 'dxxxxxxxx'
    uploadPreset: 'kms_menu_images',
};
```

## Free Tier Limits

Cloudinary's free tier includes:
- **25 GB** of storage
- **25 GB** of bandwidth per month
- **25,000** transformations per month

This is more than enough for a canteen management app!

## Troubleshooting

### "Upload preset not found" error
- Make sure the preset name matches exactly: `kms_menu_images`
- Make sure the preset is set to **Unsigned**

### "Invalid cloud name" error
- Double-check your cloud name from the Cloudinary dashboard
- Make sure there are no extra spaces

### Image not uploading
- Check your internet connection
- Make sure you've granted camera/gallery permissions to the app
