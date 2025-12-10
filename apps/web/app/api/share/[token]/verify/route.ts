import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;
        const body = await request.json();
        const { password } = body;

        if (!password) {
            return NextResponse.json({ error: 'Password is required' }, { status: 400 });
        }

        // Use service role key to bypass RLS for public share links
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // Get share link by token
        const { data: shareLink, error: shareLinkError } = await supabase
            .from('shared_trips')
            .select('password_hash')
            .eq('share_token', token)
            .eq('is_active', true)
            .single();

        if (shareLinkError || !shareLink) {
            return NextResponse.json({ error: 'Share link not found' }, { status: 404 });
        }

        // For now, we'll do simple comparison (in production, use bcrypt)
        // Note: Client should send hashed password
        const isValid = password === shareLink.password_hash;

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }

        return NextResponse.json({
            success: true,
            message: 'Password verified',
        });
    } catch (error) {
        console.error('Error verifying password:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
