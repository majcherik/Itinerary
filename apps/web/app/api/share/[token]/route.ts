import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;

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
            .select('*')
            .eq('share_token', token)
            .eq('is_active', true)
            .single();

        if (shareLinkError || !shareLink) {
            return NextResponse.json({ error: 'Share link not found' }, { status: 404 });
        }

        // Check if link has expired
        if (shareLink.expires_at) {
            const expiryDate = new Date(shareLink.expires_at);
            if (expiryDate < new Date()) {
                return NextResponse.json({ error: 'Share link has expired' }, { status: 410 });
            }
        }

        // Get trip data with all relations
        const { data: trip, error: tripError } = await supabase
            .from('trips')
            .select(`
                *,
                itinerary:itinerary_items(*),
                packingList:packing_items(*),
                documents(*),
                wallet:tickets(*),
                accommodation(*),
                transport(*),
                expenses(*)
            `)
            .eq('id', shareLink.trip_id)
            .single();

        if (tripError || !trip) {
            return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
        }

        // Transform trip data (same as TripContext)
        const transformedTrip = {
            ...trip,
            itinerary: (trip.itinerary || []).map((item: any) => ({
                ...item,
                title: item.activity,
                description: item.notes,
            })),
            documents: (trip.documents || []).map((doc: any) => ({
                ...doc,
                content:
                    typeof doc.content === 'string' ? doc.content.split('\n') : doc.content,
            })),
            expenses: (trip.expenses || []).map((exp: any) => ({
                ...exp,
                splitWith: exp.split_with,
            })),
            members: trip.members || ['Me'],
            isPasswordProtected: !!shareLink.password_hash,
        };

        return NextResponse.json({
            success: true,
            trip: transformedTrip,
            shareLink: {
                expiresAt: shareLink.expires_at,
                isPasswordProtected: !!shareLink.password_hash,
            },
        });
    } catch (error) {
        console.error('Error fetching shared trip:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
