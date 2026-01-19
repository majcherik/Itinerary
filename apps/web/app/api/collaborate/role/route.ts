import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../lib/supabase';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const roleSchema = z.object({
  tripId: z.number(),
  userId: z.string().uuid(),
  role: z.enum(['editor', 'viewer']),
});

// ============================================================================
// PUT /api/collaborate/role
// Update a collaborator's role (owner only)
// ============================================================================

export async function PUT(request: NextRequest) {
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
    const validation = roleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { tripId, userId, role } = validation.data;

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
        { error: 'Only trip owners can change collaborator roles' },
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

    // Cannot change owner role
    if (targetCollab.role === 'owner') {
      return NextResponse.json(
        { error: 'Cannot change owner role. Transfer ownership instead.' },
        { status: 400 }
      );
    }

    // Cannot change role of former member
    if (targetCollab.status === 'former_member') {
      return NextResponse.json(
        { error: 'Cannot change role of former member' },
        { status: 400 }
      );
    }

    // Update collaborator role
    const { error: updateError } = await supabase
      .from('trip_collaborators')
      .update({ role })
      .eq('trip_id', tripId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating collaborator role:', updateError);
      return NextResponse.json(
        { error: 'Failed to update role' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Collaborator role updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PUT /api/collaborate/role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
