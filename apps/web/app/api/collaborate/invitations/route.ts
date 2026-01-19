import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../lib/supabase';

// ============================================================================
// GET /api/collaborate/invitations
// Get pending invitations for current user
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Get pending invitations for user's email
    const { data: invitations, error: invitationsError } = await supabase
      .from('trip_invitations')
      .select(`
        id,
        trip_id,
        email,
        role,
        invited_by,
        invited_at,
        expires_at,
        status,
        responded_at,
        trip:trips!trip_invitations_trip_id_fkey (
          id,
          title,
          city,
          start_date,
          end_date
        ),
        inviter:profiles!trip_invitations_invited_by_fkey (
          id,
          email,
          display_name
        )
      `)
      .eq('email', profile.email)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('invited_at', { ascending: false });

    if (invitationsError) {
      console.error('Error fetching invitations:', invitationsError);
      return NextResponse.json(
        { error: 'Failed to fetch invitations' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        invitations: invitations || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/collaborate/invitations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
