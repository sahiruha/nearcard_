import { Hono } from 'hono';
import type { Env, ProfileRow } from '../types';

const app = new Hono<{ Bindings: Env }>();

function formatProfile(row: ProfileRow) {
  return {
    name: row.name,
    title: row.title,
    organization: row.organization,
    avatar: row.avatar_url,
    nearAccount: row.near_account,
    links: JSON.parse(row.links || '[]'),
  };
}

// GET /api/profiles/:accountId — プロフィール取得
app.get('/api/profiles/:accountId', async (c) => {
  const accountId = c.req.param('accountId');

  const row = await c.env.DB.prepare(
    'SELECT * FROM profiles WHERE account_id = ?'
  ).bind(accountId).first<ProfileRow>();

  if (!row) return c.json(null);
  return c.json(formatProfile(row));
});

// PUT /api/profiles/:accountId — プロフィール UPSERT
app.put('/api/profiles/:accountId', async (c) => {
  const accountId = c.req.param('accountId');
  const body = await c.req.json<{
    name: string;
    title?: string;
    organization?: string;
    avatar?: string;
    nearAccount?: string;
    links?: unknown[];
  }>();

  if (!body.name) {
    return c.json({ error: 'name is required' }, 400);
  }

  const linksJson = JSON.stringify(body.links || []);

  await c.env.DB.prepare(
    `INSERT INTO profiles (account_id, name, title, organization, avatar_url, near_account, links)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(account_id) DO UPDATE SET
       name = excluded.name,
       title = excluded.title,
       organization = excluded.organization,
       avatar_url = excluded.avatar_url,
       near_account = excluded.near_account,
       links = excluded.links,
       updated_at = datetime('now')`
  ).bind(
    accountId,
    body.name,
    body.title || '',
    body.organization || '',
    body.avatar || null,
    body.nearAccount || null,
    linksJson
  ).run();

  return c.json({ success: true });
});

export default app;
