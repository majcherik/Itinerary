import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../lib/supabase';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const leaveSchema = z.object({
  tripId: z.number(),
});

// ============================================================================
// POST /api/collaborate/leave
// Leave a trip (collaborators only, not owners)
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
    const validation = leaveSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { tripId } = validation.data;

    // Get user's collaborator record
    const { data: collaborator, error: collabError } = await supabase
      .from('trip_collaborators')
      .select('role, status')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .single();

    if (collabError || !collaborator) {
      return NextResponse.json(
        { error: 'You are not a collaborator on this trip' },
        { status: 404 }
      );
    }

    // Owners cannot leave (they must transfer ownership or delete trip)
    if (collaborator.role === 'owner') {
      return NextResponse.json(
        { error: 'Trip owners cannot leave. Please transfer ownership or delete the trip.' },
        { status: 400 }
      );
    }

    // Cannot leave if already former member
    if (collaborator.status === 'former_member') {
      return NextResponse.json(
        { error: 'You have already left this trip' },
        { status: 400 }
      );
    }

    // Update collaborator status to former_member
    const { error: updateError } = await supabase
      .from('trip_collaborators')
      .update({
        status: 'former_member',
        left_at: new Date().toISOString(),
      })
      .eq('trip_id', tripId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error leaving trip:', updateError);
      return NextResponse.json(
        { error: 'Failed to leave trip' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'You have left the trip successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/collaborate/leave:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
