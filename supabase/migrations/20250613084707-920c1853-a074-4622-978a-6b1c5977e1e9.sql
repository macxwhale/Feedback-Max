
-- Add missing RLS policies for questions table to allow CRUD operations

-- Policy for INSERT: Allow organization admins to create questions for their org
CREATE POLICY "Organization admins can create questions" 
  ON public.questions 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_users 
      WHERE user_id = auth.uid() 
      AND role = 'admin' 
      AND status = 'active'
    )
  );

-- Policy for UPDATE: Allow organization admins to update questions they own
CREATE POLICY "Organization admins can update their questions" 
  ON public.questions 
  FOR UPDATE 
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_users 
      WHERE user_id = auth.uid() 
      AND role = 'admin' 
      AND status = 'active'
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_users 
      WHERE user_id = auth.uid() 
      AND role = 'admin' 
      AND status = 'active'
    )
  );

-- Policy for DELETE: Allow organization admins to delete questions they own
CREATE POLICY "Organization admins can delete their questions" 
  ON public.questions 
  FOR DELETE 
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.organization_users 
      WHERE user_id = auth.uid() 
      AND role = 'admin' 
      AND status = 'active'
    )
  );

-- Add proper foreign key constraints (drop first if they exist, then add)
DO $$ 
BEGIN 
  -- Add foreign key constraint for organization
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_questions_organization' 
    AND table_name = 'questions'
  ) THEN
    ALTER TABLE public.questions 
    ADD CONSTRAINT fk_questions_organization 
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
  END IF;

  -- Add foreign key constraint for category
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_questions_category' 
    AND table_name = 'questions'
  ) THEN
    ALTER TABLE public.questions 
    ADD CONSTRAINT fk_questions_category 
    FOREIGN KEY (category_id) REFERENCES public.question_categories(id);
  END IF;

  -- Add foreign key constraint for type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_questions_type' 
    AND table_name = 'questions'
  ) THEN
    ALTER TABLE public.questions 
    ADD CONSTRAINT fk_questions_type 
    FOREIGN KEY (type_id) REFERENCES public.question_types(id);
  END IF;

  -- Add check constraint for positive order_index
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_positive_order_index' 
    AND table_name = 'questions'
  ) THEN
    ALTER TABLE public.questions 
    ADD CONSTRAINT check_positive_order_index 
    CHECK (order_index > 0);
  END IF;
END $$;

-- Ensure required fields are properly constrained
ALTER TABLE public.questions 
ALTER COLUMN question_text SET NOT NULL;

ALTER TABLE public.questions 
ALTER COLUMN organization_id SET NOT NULL;
