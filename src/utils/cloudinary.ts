// Cloudinary integration utility
export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dmqcpclos',
  apiKey: '223153622596143',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'art-gallery-unsigned',
};

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('cloud_name', CLOUDINARY_CONFIG.cloudName);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Upload failed');
    return data.secure_url; // Returns HTTPS URL
  } catch (error: any) {
    throw new Error(`Cloudinary upload error: ${error.message}`);
  }
};
