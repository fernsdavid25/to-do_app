
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './supabase';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());

// Middleware to forward Authorization header to Supabase
const createScopedClient = (token?: string) => {
    if (!token) return supabase; // Fallback to anon/service client if explicit token missing (or handle error)

    return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!, {
        global: {
            headers: {
                Authorization: token,
            },
        },
    });
};

app.use((req, res, next) => {
    // @ts-ignore
    req.supabase = createScopedClient(req.headers.authorization);
    next();
});

// Get all tasks with search and sort
app.get('/tasks', async (req, res) => {
    const { search, sort, status } = req.query;

    // @ts-ignore
    let query = req.supabase.from('tasks').select('*');

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

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Create task
app.post('/tasks', async (req, res) => {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    // @ts-ignore
    const { data, error } = await req.supabase
        .from('tasks')
        .insert([{ title, description }])
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data[0]);
});

// Update task
app.put('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, is_complete } = req.body;

    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (is_complete !== undefined) updates.is_complete = is_complete;

    // @ts-ignore
    const { data, error } = await req.supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data[0]);
});

// Delete task
app.delete('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    // @ts-ignore
    const { error } = await req.supabase
        .from('tasks')
        .delete()
        .eq('id', id);

    if (error) return res.status(500).json({ error: error.message });
    res.status(204).send();
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
