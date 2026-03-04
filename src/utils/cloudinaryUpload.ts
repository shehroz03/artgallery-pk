export async function uploadToCloudinary(file: File, {
  cloudName = 'dmqcpclos',
  apiKey = '223153622596143',
  uploadPreset = 'art-gallery-unsigned',
} = {}) {
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('api_key', apiKey);
  // Optionally add timestamp, signature for signed uploads
  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Cloudinary upload failed');
  return await res.json();
}
