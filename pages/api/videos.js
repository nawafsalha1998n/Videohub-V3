import { createClient } from '@supabase/supabase-js';

/**
 * Server-side API route to insert a new video record in Supabase.
 * - Expects POST { title, publicId } in JSON body.
 * - Uses SUPABASE_SERVICE_ROLE_KEY (server-only) for authentication.
 *
 * IMPORTANT:
 *  - Do NOT expose SUPABASE_SERVICE_ROLE_KEY to the client. Add it in Vercel dashboard
 *    as an environment variable named SUPABASE_SERVICE_ROLE_KEY.
 *  - Keep SUPABASE_URL in the env as SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL if client needs it).
 */

const supabaseAdmin = createClient(
  // Use the non-public SUPABASE URL and the server-side service role key
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { title, publicId } = req.body || {};

    if (!publicId) {
      return res.status(400).json({ error: 'Missing publicId in request body' });
    }

    // Insert into "videos" table. Adjust column names if your table differs.
    const { data, error } = await supabaseAdmin
      .from('videos')
      .insert([{ title: title ?? '', public_id: publicId }])
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ data });
  } catch (err) {
    console.error('API /api/videos error:', err);
    return res.status(500).json({ error: err.message ?? String(err) });
  }
}
