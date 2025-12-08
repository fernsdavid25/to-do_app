import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createScopedClient } from '../_supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const client = createScopedClient(req.headers.authorization as string);

    if (req.method === 'GET') {
        const { search, sort, status } = req.query;

        let query = client.from('tasks').select('*');

        if (status && status !== 'all') {
            if (status === 'complete') {
                query = query.eq('is_complete', true);
            } else if (status === 'incomplete') {
                query = query.eq('is_complete', false);
            }
        }

        if (search) {
            query = query.ilike('title', `%${search}%`);
        }

        if (sort === 'name') {
            query = query.order('title', { ascending: true });
        } else if (sort === 'status') {
            query = query.order('is_complete', { ascending: true });
        } else {
            query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query;

        if (error) {
            return res.status(500).json({ error: error.message });
        }
        return res.status(200).json(data);
    }

    if (req.method === 'POST') {
        const { title, description } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const { data, error } = await client
            .from('tasks')
            .insert([{ title, description }])
            .select();

        if (error) {
            return res.status(500).json({ error: error.message });
        }
        return res.status(201).json(data[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
