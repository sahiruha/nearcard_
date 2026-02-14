import { Hono } from 'hono';
import type { Env } from '../types';

const app = new Hono<{ Bindings: Env }>();

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// POST /api/upload/avatar — アバター画像アップロード
app.post('/api/upload/avatar', async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File | null;
  const accountId = formData.get('accountId') as string | null;

  if (!file || !accountId) {
    return c.json({ error: 'file and accountId are required' }, 400);
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return c.json({ error: 'Unsupported file type. Use JPEG, PNG, WebP, or GIF.' }, 400);
  }

  if (file.size > MAX_FILE_SIZE) {
    return c.json({ error: 'File too large. Max 2MB.' }, 400);
  }

  const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
  const key = `avatars/${accountId}.${ext}`;

  await c.env.BUCKET.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  });

  // 古いアバターを掃除（異なる拡張子がある場合）
  const extensions = ['jpg', 'png', 'webp', 'gif'];
  for (const e of extensions) {
    if (e !== ext) {
      await c.env.BUCKET.delete(`avatars/${accountId}.${e}`);
    }
  }

  const avatarUrl = `/api/avatars/${accountId}.${ext}`;
  return c.json({ success: true, avatarUrl });
});

// GET /api/avatars/:key — アバター画像配信
app.get('/api/avatars/:key', async (c) => {
  const key = `avatars/${c.req.param('key')}`;

  const object = await c.env.BUCKET.get(key);
  if (!object) return c.notFound();

  const headers = new Headers();
  headers.set('Content-Type', object.httpMetadata?.contentType || 'image/jpeg');
  headers.set('Cache-Control', 'public, max-age=86400');

  return new Response(object.body, { headers });
});

export default app;
