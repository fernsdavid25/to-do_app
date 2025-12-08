import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createScopedClient } from '../_supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { id } = req.query;
    const client = createScopedClient(req.headers.authorization as string);

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid task ID' });
    }

    if (req.method === 'PUT') {
        const { title, description, is_complete } = req.body;

        const updates: any = {};
        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (is_complete !== undefined) updates.is_complete = is_complete;

        const { data, error } = await client
            .from('tasks')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) {
            return res.status(500).json({ error: error.message });
        }
        return res.status(200).json(data[0]);
    }

    if (req.method === 'DELETE') {
        const { error } = await client
            .from('tasks')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(500).json({ error: error.message });
        }
        return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
