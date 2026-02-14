import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';
import redirectApp from './routes/redirect';
import cardsApp from './routes/cards';
import profilesApp from './routes/profiles';
import uploadApp from './routes/upload';

const app = new Hono<{ Bindings: Env }>();

// CORS設定
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
}));

// ヘルスチェック
app.get('/health', (c) => c.json({ status: 'ok' }));

// ルート登録
app.route('/', redirectApp);   // GET /c/:cardId
app.route('/', cardsApp);      // /api/cards/*
app.route('/', profilesApp);   // /api/profiles/*
app.route('/', uploadApp);     // /api/upload/*, /api/avatars/*

export default app;
