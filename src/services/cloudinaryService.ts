// Cloudinary Image Upload Service (Free tier — no credit card needed)
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dmqcpclos';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'art-gallery-unsigned'; // unsigned upload preset

export const cloudinaryService = {
    /**
     * Upload an image file to Cloudinary
     * Returns the secure URL of the uploaded image
     */
    async uploadImage(file: File, folder = 'artgallery'): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('folder', folder);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Image upload failed');
        }

        const data = await response.json();
        return data.secure_url as string;
    },

    /**
     * Upload artwork image
     */
    async uploadArtwork(file: File): Promise<string> {
        return this.uploadImage(file, 'artgallery/artworks');
    },

    /**
     * Upload artist avatar
     */
    async uploadAvatar(file: File): Promise<string> {
        return this.uploadImage(file, 'artgallery/avatars');
    },
};
