const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const STALL_IMAGE_BUCKET = import.meta.env.VITE_SUPABASE_STALL_BUCKET || "stall-image";

// Default placeholder image for when no image is provided
const DEFAULT_STALL_IMAGE = "https://images.unsplash.com/photo-1555939594-58d7cb561404?w=400&h=300&fit=crop";
const DEFAULT_MENU_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop";

const sanitizeFileName = (fileName) =>
  fileName.replace(/[^a-zA-Z0-9._-]/g, "-");

const buildPublicUrl = (bucketName, objectPath) =>
  `${SUPABASE_URL}/storage/v1/object/public/${bucketName}/${objectPath}`;

export const getStorageConfigError = () => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return "Missing Supabase config. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in web/snackdash-frontend/.env.";
  }
  return "";
};

/**
 * Upload image directly to Supabase Storage
 * Uses ANON key for public uploads (requires RLS policies to be disabled or configured for public access)
 */
export const uploadImageToSupabase = async (file, folder = "stalls") => {
  const configError = getStorageConfigError();
  if (configError) {
    console.warn("⚠️ Supabase config error:", configError);
    return folder === "stalls" ? DEFAULT_STALL_IMAGE : DEFAULT_MENU_IMAGE;
  }

  try {
    console.log("📤 Uploading to Supabase:", folder);
    
    const fileExt = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
    const safeName = sanitizeFileName(file.name.replace(/\.[^.]+$/, ""));
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const objectPath = `${folder}/${timestamp}-${randomStr}-${safeName}.${fileExt}`;

    const uploadResponse = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${STALL_IMAGE_BUCKET}/${objectPath}`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "x-upsert": "false",
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      }
    );

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({ message: uploadResponse.statusText }));
      console.error("❌ Supabase error response:", errorData);

      // If 401/403 (permission denied), provide helpful message
      if (uploadResponse.status === 401 || uploadResponse.status === 403) {
        throw new Error(
          "Storage access denied. Check Supabase RLS policies:\n" +
          "1. Go to Supabase Dashboard > Storage > stall-image\n" +
          "2. Click 'Policies' and disable RLS or create an 'Allow public uploads' policy"
        );
      }

      throw new Error(`Upload failed: ${errorData.message || uploadResponse.statusText}`);
    }

    const publicUrl = buildPublicUrl(STALL_IMAGE_BUCKET, objectPath);
    console.log("✅ Image uploaded successfully:", publicUrl);
    return publicUrl;

  } catch (error) {
    console.error("❌ Upload error:", error.message);
    throw error; // Let the component handle the error
  }
};

export const getDefaultStallImage = () => DEFAULT_STALL_IMAGE;
export const getDefaultMenuImage = () => DEFAULT_MENU_IMAGE;
