import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                },
            }
        );

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { tripId, password, expiresAt } = body;

        if (!tripId) {
            return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 });
        }

        // Verify user owns the trip
        const { data: trip, error: tripError } = await supabase
            .from('trips')
            .select('id, user_id')
            .eq('id', tripId)
            .single();

        if (tripError || !trip) {
            return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
        }

        if (trip.user_id !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Generate unique share token
        const { data: tokenData, error: tokenError } = await supabase.rpc(
            'generate_share_token'
        );

        if (tokenError) {
            console.error('Error generating token:', tokenError);
            return NextResponse.json(
                { error: 'Failed to generate share token' },
                { status: 500 }
            );
        }

        const shareToken = tokenData as string;

        // Hash password if provided (client-side should already hash it)
        const passwordHash = password || null;

        // Create share link
        const { data: shareLink, error: shareLinkError } = await supabase
            .from('shared_trips')
            .insert({
                trip_id: tripId,
                share_token: shareToken,
                password_hash: passwordHash,
                expires_at: expiresAt || null,
                is_active: true,
                created_by: user.id,
            })
            .select()
            .single();

        if (shareLinkError) {
            console.error('Error creating share link:', shareLinkError);
            return NextResponse.json(
                { error: 'Failed to create share link' },
                { status: 500 }
            );
        }

        // Return the share link data
        const shareUrl = `${request.nextUrl.origin}/shared/${shareToken}`;

        return NextResponse.json({
            success: true,
            shareLink: {
                id: shareLink.id,
                token: shareToken,
                url: shareUrl,
                expiresAt: shareLink.expires_at,
                isProtected: !!passwordHash,
            },
        });
    } catch (error) {
        console.error('Error in share creation:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
