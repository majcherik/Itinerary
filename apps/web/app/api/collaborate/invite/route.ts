import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../lib/supabase';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const inviteSchema = z.object({
  tripId: z.number(),
  email: z.string().email(),
  role: z.enum(['editor', 'viewer']),
});

// ============================================================================
// POST /api/collaborate/invite
// Send invitation to collaborate on a trip
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
    const validation = inviteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { tripId, email, role } = validation.data;

    // Verify user is owner of the trip
    const { data: collaborator, error: collabError } = await supabase
      .from('trip_collaborators')
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (collabError || !collaborator || collaborator.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only trip owners can send invitations' },
        { status: 403 }
      );
    }

    // Check if email is already a collaborator
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (profile) {
      const { data: existingCollab } = await supabase
        .from('trip_collaborators')
        .select('id, status')
        .eq('trip_id', tripId)
        .eq('user_id', profile.id)
        .single();

      if (existingCollab) {
        if (existingCollab.status === 'active') {
          return NextResponse.json(
            { error: 'User is already a collaborator on this trip' },
            { status: 400 }
          );
        } else {
          return NextResponse.json(
            { error: 'User was previously a member of this trip' },
            { status: 400 }
          );
        }
      }
    }

    // Check for existing pending invitation
    const { data: existingInvite } = await supabase
      .from('trip_invitations')
      .select('id')
      .eq('trip_id', tripId)
      .eq('email', email)
      .eq('status', 'pending')
      .single();

    if (existingInvite) {
      return NextResponse.json(
        { error: 'An invitation has already been sent to this email' },
        { status: 400 }
      );
    }

    // Create invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('trip_invitations')
      .insert({
        trip_id: tripId,
        email: email.toLowerCase(),
        role,
        invited_by: user.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      })
      .select()
      .single();

    if (inviteError) {
      console.error('Error creating invitation:', inviteError);
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 500 }
      );
    }

    // TODO: Send email notification to the invitee
    // This would integrate with an email service like SendGrid, Resend, etc.

    return NextResponse.json(
      {
        success: true,
        invitation,
        message: 'Invitation sent successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/collaborate/invite:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
