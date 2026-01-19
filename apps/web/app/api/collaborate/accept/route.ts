import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../lib/supabase';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const acceptSchema = z.object({
  invitationId: z.string().uuid(),
});

// ============================================================================
// POST /api/collaborate/accept
// Accept a trip invitation
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
    const validation = acceptSchema.safeParse(body);

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

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      // Update invitation status to expired
      await supabase
        .from('trip_invitations')
        .update({ status: 'expired', responded_at: new Date().toISOString() })
        .eq('id', invitationId);

      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      );
    }

    // Check if user is already a collaborator (shouldn't happen but safety check)
    const { data: existingCollab } = await supabase
      .from('trip_collaborators')
      .select('id')
      .eq('trip_id', invitation.trip_id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (existingCollab) {
      return NextResponse.json(
        { error: 'You are already a collaborator on this trip' },
        { status: 400 }
      );
    }

    // Create collaborator record
    const { error: collabError } = await supabase
      .from('trip_collaborators')
      .insert({
        trip_id: invitation.trip_id,
        user_id: user.id,
        role: invitation.role,
        status: 'active',
        invited_by: invitation.invited_by,
        invited_at: invitation.invited_at,
        joined_at: new Date().toISOString(),
      });

    if (collabError) {
      console.error('Error creating collaborator:', collabError);
      return NextResponse.json(
        { error: 'Failed to accept invitation' },
        { status: 500 }
      );
    }

    // Update invitation status
    const { error: updateError } = await supabase
      .from('trip_invitations')
      .update({
        status: 'accepted',
        responded_at: new Date().toISOString(),
      })
      .eq('id', invitationId);

    if (updateError) {
      console.error('Error updating invitation:', updateError);
    }

    return NextResponse.json(
      {
        success: true,
        tripId: invitation.trip_id,
        message: 'Invitation accepted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/collaborate/accept:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
