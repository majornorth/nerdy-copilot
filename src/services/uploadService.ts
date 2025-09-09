import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: any = null;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

const IMAGE_BUCKET = 'lesson-plan-images';

export async function uploadImageAndGetPublicUrl(file: File): Promise<string | null> {
  if (!supabase) {
    console.warn('Supabase is not configured; cannot upload image.');
    return null;
  }

  try {
    const ext = file.name.split('.').pop() || 'png';
    const path = `${new Date().toISOString().slice(0,10)}/${cryptoRandom()}.${ext}`;

    const { error: uploadError } = await supabase
      .storage
      .from(IMAGE_BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'image/png'
      });

    if (uploadError) {
      console.error('Image upload error:', uploadError);
      return null;
    }

    const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
    return data?.publicUrl || null;
  } catch (err) {
    console.error('Unexpected error uploading image:', err);
    return null;
  }
}

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    } catch (e) {
      reject(e);
    }
  });
}

function cryptoRandom(): string {
  try {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return Math.random().toString(36).slice(2);
  }
}
