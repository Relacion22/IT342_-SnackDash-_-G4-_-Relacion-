import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const bucketName = import.meta.env.VITE_SUPABASE_STALL_BUCKET;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Uploads an image to the Supabase bucket and returns the public URL.
 * @param {File} file - The image file from an <input type="file">
 * @param {string} folder - Optional subfolder (e.g., 'stalls' or 'menu')
 * @returns {Promise<string>} - The public URL of the uploaded image
 */
export const uploadImageToSupabase = async (file, folder = 'stalls') => {
  if (!file) return null;

  try {
    // 1. Create a unique file name to prevent overwriting
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    // 2. Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error.message);
      throw error;
    }

    // 3. Get the Public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};
