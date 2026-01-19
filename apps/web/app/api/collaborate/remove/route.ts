import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../lib/supabase';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const removeSchema = z.object({
  tripId: z.number(),
  userId: z.string().uuid(),
});

// ============================================================================
// POST /api/collaborate/remove
// Remove a collaborator from a trip (owner only)
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
    const validation = removeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { tripId, userId } = validation.data;

    // Verify requester is owner
    const { data: requesterCollab, error: requesterError } = await supabase
      .from('trip_collaborators')
      .select('role')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (requesterError || !requesterCollab || requesterCollab.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only trip owners can remove collaborators' },
        { status: 403 }
      );
    }

    // Get target collaborator
    const { data: targetCollab, error: targetError } = await supabase
      .from('trip_collaborators')
      .select('role, status')
      .eq('trip_id', tripId)
      .eq('user_id', userId)
      .single();

    if (targetError || !targetCollab) {
      return NextResponse.json(
        { error: 'Collaborator not found' },
        { status: 404 }
      );
    }

    // Cannot remove owner
    if (targetCollab.role === 'owner') {
      return NextResponse.json(
        { error: 'Cannot remove trip owner' },
        { status: 400 }
      );
    }

    // Cannot remove if already former member
    if (targetCollab.status === 'former_member') {
      return NextResponse.json(
        { error: 'User is already a former member' },
        { status: 400 }
      );
    }

    // Update collaborator status to former_member
    const { error: updateError } = await supabase
      .from('trip_collaborators')
      .update({
        status: 'former_member',
        removed_at: new Date().toISOString(),
        removed_by: user.id,
      })
      .eq('trip_id', tripId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error removing collaborator:', updateError);
      return NextResponse.json(
        { error: 'Failed to remove collaborator' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Collaborator removed successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/collaborate/remove:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
