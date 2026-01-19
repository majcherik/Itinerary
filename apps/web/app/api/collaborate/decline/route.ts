import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../lib/supabase';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const declineSchema = z.object({
  invitationId: z.string().uuid(),
});

// ============================================================================
// POST /api/collaborate/decline
// Decline a trip invitation
// ============================================================================

export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json();
    const validation = declineSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { invitationId } = validation.data;

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

    // Get invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('trip_invitations')
      .select('*')
      .eq('id', invitationId)
      .eq('email', profile.email)
      .eq('status', 'pending')
      .single();

    if (inviteError || !invitation) {
      return NextResponse.json(
        { error: 'Invitation not found or already responded to' },
        { status: 404 }
      );
    }

    // Update invitation status to declined
    const { error: updateError } = await supabase
      .from('trip_invitations')
      .update({
        status: 'declined',
        responded_at: new Date().toISOString(),
      })
      .eq('id', invitationId);

    if (updateError) {
      console.error('Error updating invitation:', updateError);
      return NextResponse.json(
        { error: 'Failed to decline invitation' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Invitation declined',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/collaborate/decline:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
