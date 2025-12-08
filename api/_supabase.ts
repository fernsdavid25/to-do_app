import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const createScopedClient = (token?: string) => {
    if (!token) return supabase;

    return createClient(supabaseUrl, supabaseKey, {
        global: {
            headers: {
                Authorization: token,
            },
        },
    });
};
