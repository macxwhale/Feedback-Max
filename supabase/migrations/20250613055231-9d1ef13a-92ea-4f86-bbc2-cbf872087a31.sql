
-- Create a table for user invitations
CREATE TABLE public.user_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  invited_by_user_id UUID REFERENCES auth.users(id) NOT NULL,
  invitation_token UUID NOT NULL DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, email)
);

-- Enable RLS for user_invitations
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for user_invitations
CREATE POLICY "Org admins can manage invitations for their org" 
  ON public.user_invitations 
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users 
      WHERE user_id = auth.uid() 
      AND organization_id = user_invitations.organization_id 
      AND role = 'admin'
    )
  );

-- Allow super admins to manage all invitations
CREATE POLICY "Super admins can manage all invitations" 
  ON public.user_invitations 
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() AND is_super_admin = true
    )
  );

-- Allow users to view invitations sent to their email
CREATE POLICY "Users can view invitations sent to them" 
  ON public.user_invitations 
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() AND email = user_invitations.email
    )
  );

-- Update organization_users table to have better role management
ALTER TABLE public.organization_users 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS invited_by_user_id UUID REFERENCES auth.users(id);

-- Create function to accept invitation
CREATE OR REPLACE FUNCTION public.accept_organization_invitation(invitation_token UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_record public.user_invitations;
  user_email TEXT;
  result jsonb;
BEGIN
  -- Get current user email
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  IF user_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not authenticated');
  END IF;
  
  -- Get invitation
  SELECT * INTO invitation_record 
  FROM public.user_invitations 
  WHERE invitation_token = accept_organization_invitation.invitation_token
  AND email = user_email
  AND status = 'pending'
  AND expires_at > now();
  
  IF invitation_record.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;
  
  -- Check if user is already a member
  IF EXISTS (
    SELECT 1 FROM public.organization_users 
    WHERE user_id = auth.uid() AND organization_id = invitation_record.organization_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'User is already a member of this organization');
  END IF;
  
  -- Add user to organization
  INSERT INTO public.organization_users (
    user_id, 
    organization_id, 
    email, 
    role, 
    invited_by_user_id,
    accepted_at
  ) VALUES (
    auth.uid(),
    invitation_record.organization_id,
    user_email,
    invitation_record.role,
    invitation_record.invited_by_user_id,
    now()
  );
  
  -- Update invitation status
  UPDATE public.user_invitations 
  SET status = 'accepted', updated_at = now()
  WHERE id = invitation_record.id;
  
  RETURN jsonb_build_object('success', true, 'organization_id', invitation_record.organization_id);
END;
$$;
