
-- Update the invite_user_to_organization function to handle enhanced roles
CREATE OR REPLACE FUNCTION public.invite_user_to_organization(
  p_email TEXT,
  p_organization_id UUID,
  p_role TEXT DEFAULT 'member',
  p_enhanced_role TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invitation_id UUID;
  v_existing_user_id UUID;
  v_inviter_id UUID := auth.uid();
  v_enhanced_role enhanced_org_role;
BEGIN
  -- Validate and convert enhanced role
  IF p_enhanced_role IS NOT NULL THEN
    BEGIN
      v_enhanced_role := p_enhanced_role::enhanced_org_role;
    EXCEPTION WHEN invalid_text_representation THEN
      v_enhanced_role := p_role::enhanced_org_role;
    END;
  ELSE
    v_enhanced_role := p_role::enhanced_org_role;
  END IF;

  -- Check if current user is org admin or manager
  IF NOT EXISTS (
    SELECT 1 FROM public.organization_users 
    WHERE user_id = v_inviter_id 
    AND organization_id = p_organization_id 
    AND enhanced_role IN ('admin', 'owner', 'manager')
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'You must be an organization admin, owner, or manager to invite users');
  END IF;

  -- Check if user already exists in auth.users
  SELECT id INTO v_existing_user_id 
  FROM auth.users 
  WHERE email = lower(trim(p_email));

  -- If user exists and is already in the organization
  IF v_existing_user_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.organization_users 
    WHERE user_id = v_existing_user_id 
    AND organization_id = p_organization_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'User is already a member of this organization');
  END IF;

  -- Check if there's already a pending invitation
  IF EXISTS (
    SELECT 1 FROM public.user_invitations 
    WHERE lower(trim(email)) = lower(trim(p_email))
    AND organization_id = p_organization_id 
    AND status = 'pending'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'An invitation is already pending for this email');
  END IF;

  -- If user exists in auth but not in org, add them directly
  IF v_existing_user_id IS NOT NULL THEN
    INSERT INTO public.organization_users (
      user_id, 
      organization_id, 
      email, 
      role, 
      enhanced_role,
      invited_by_user_id,
      accepted_at
    ) VALUES (
      v_existing_user_id,
      p_organization_id,
      lower(trim(p_email)),
      p_role,
      v_enhanced_role,
      v_inviter_id,
      now()
    );
    
    RETURN jsonb_build_object(
      'success', true, 
      'message', 'User added to organization successfully',
      'type', 'direct_add'
    );
  ELSE
    -- Create invitation for new user
    INSERT INTO public.user_invitations (
      email,
      organization_id,
      role,
      enhanced_role,
      invited_by_user_id
    ) VALUES (
      lower(trim(p_email)),
      p_organization_id,
      p_role,
      v_enhanced_role,
      v_inviter_id
    ) RETURNING id INTO v_invitation_id;
    
    RETURN jsonb_build_object(
      'success', true, 
      'message', 'Invitation sent successfully',
      'invitation_id', v_invitation_id,
      'type', 'invitation'
    );
  END IF;
END;
$$;
