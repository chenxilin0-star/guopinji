import { Hono } from 'hono';
import { queryAll, queryFirst } from '../db';
import type { Env } from '../db';
import type { Company, Job } from '../types';

const app = new Hono<{ Bindings: Env }>();

// 公司列表
app.get('/', async (c) => {
  const q = c.req.query('q') || '';
  const industry = c.req.query('industry') || '';
  const province = c.req.query('province') || '';
  const page = Math.max(1, parseInt(c.req.query('page') || '1', 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(c.req.query('pageSize') || '20', 10)));
  const offset = (page - 1) * pageSize;

  let where = '1=1';
  const params: unknown[] = [];

  if (q) {
    where += ' AND (name LIKE ? OR short_name LIKE ?)';
    const like = `%${q}%`;
    params.push(like, like);
  }
  if (industry) {
    where += ' AND industry = ?';
    params.push(industry);
  }
  if (province) {
    where += ' AND province = ?';
    params.push(province);
  }

  const countResult = await queryFirst<{ total: number }>(c.env.DB, `SELECT COUNT(*) as total FROM companies WHERE ${where}`, params);
  const total = countResult?.total || 0;

  const companies = await queryAll<Company>(c.env.DB, `SELECT * FROM companies WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, pageSize, offset]);

  return c.json({
    data: companies,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
});

// 公司详情
app.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  if (isNaN(id)) return c.json({ error: '无效ID' }, 400);

  const company = await queryFirst<Company>(c.env.DB, 'SELECT * FROM companies WHERE id = ?', [id]);
  if (!company) return c.json({ error: '公司不存在' }, 404);

  return c.json(company);
});

// 公司职位
app.get('/:id/jobs', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  if (isNaN(id)) return c.json({ error: '无效ID' }, 400);

  const page = Math.max(1, parseInt(c.req.query('page') || '1', 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(c.req.query('pageSize') || '20', 10)));
  const offset = (page - 1) * pageSize;

  const countResult = await queryFirst<{ total: number }>(c.env.DB, 'SELECT COUNT(*) as total FROM jobs WHERE company_id = ? AND is_deleted = 0 AND status = \'active\'', [id]);
  const total = countResult?.total || 0;

  const jobs = await queryAll<Job>(c.env.DB,
    'SELECT * FROM jobs WHERE company_id = ? AND is_deleted = 0 AND status = \'active\' ORDER BY publish_date DESC LIMIT ? OFFSET ?',
    [id, pageSize, offset]
  );

  return c.json({
    data: jobs,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
});

export default app;
