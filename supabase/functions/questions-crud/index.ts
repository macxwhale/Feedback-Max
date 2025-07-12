
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.22.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface QuestionData {
  question_text: string;
  question_type: string;
  category: string;
  order_index: number;
  help_text?: string;
  placeholder_text?: string;
  is_required?: boolean;
  options?: { text: string; value?: string }[];
  scaleConfig?: {
    minValue: number;
    maxValue: number;
    minLabel?: string;
    maxLabel?: string;
    stepSize?: number;
  };
}

const questionSchema = z.object({
  question_text: z.string().min(1).max(2000), // Increased limit for longer questions
  question_type: z.string().min(1),
  category: z.string().min(1),
  order_index: z.number().int().min(0),
  help_text: z.string().max(1000).optional(),
  placeholder_text: z.string().max(500).optional(),
  is_required: z.boolean().optional(),
  options: z.array(z.object({
    text: z.string().max(500),
    value: z.string().max(500).optional()
  })).optional(),
  scaleConfig: z.object({
    minValue: z.number(),
    maxValue: z.number(),
    minLabel: z.string().max(100).optional(),
    maxLabel: z.string().max(100).optional(),
    stepSize: z.number().optional()
  }).optional()
});

function createErrorResponse(message: string, status: number = 400, details?: any) {
  console.error('API Error:', message, details ? JSON.stringify(details) : '');
  return new Response(JSON.stringify({ error: message, details }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function validateQuestionType(supabase: any, questionType: string) {
  const { data: questionTypeData, error } = await supabase
    .from('question_types')
    .select('id')
    .eq('name', questionType)
    .single();

  if (error || !questionTypeData) {
    throw new Error(`Invalid question type: ${questionType}`);
  }
  return questionTypeData.id;
}

async function validateQuestionCategory(supabase: any, category: string) {
  const { data: categoryData, error } = await supabase
    .from('question_categories')
    .select('id')
    .eq('name', category)
    .single();

  if (error || !categoryData) {
    throw new Error(`Invalid question category: ${category}`);
  }
  return categoryData.id;
}

async function handleQuestionOptions(supabase: any, questionId: string, options?: { text: string; value?: string }[]) {
  // Delete existing options
  const { error: deleteError } = await supabase
    .from('question_options')
    .delete()
    .eq('question_id', questionId);

  if (deleteError) {
    console.error('Error deleting existing options:', deleteError);
    throw new Error('Failed to update question options');
  }

  // Insert new options if provided
  if (options && options.length > 0) {
    const optionsData = options.map((option, index) => ({
      question_id: questionId,
      option_text: option.text,
      option_value: option.value || option.text,
      display_order: index + 1
    }));

    const { error: insertError } = await supabase
      .from('question_options')
      .insert(optionsData);

    if (insertError) {
      console.error('Error inserting new options:', insertError);
      throw new Error('Failed to save question options');
    }
  }
}

async function handleQuestionScale(supabase: any, questionId: string, scaleConfig?: any) {
  // Delete existing scale config
  const { error: deleteError } = await supabase
    .from('question_scale_config')
    .delete()
    .eq('question_id', questionId);

  if (deleteError) {
    console.error('Error deleting existing scale config:', deleteError);
    throw new Error('Failed to update scale configuration');
  }

  // Insert new scale config if provided
  if (scaleConfig) {
    const { error: insertError } = await supabase
      .from('question_scale_config')
      .insert({
        question_id: questionId,
        min_value: scaleConfig.minValue,
        max_value: scaleConfig.maxValue,
        min_label: scaleConfig.minLabel,
        max_label: scaleConfig.maxLabel,
        step_size: scaleConfig.stepSize || 1
      });

    if (insertError) {
      console.error('Error inserting scale config:', insertError);
      throw new Error('Failed to save scale configuration');
    }
  }
}

serve(async (req) => {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] ${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return createErrorResponse('Authentication required', 401);
    }

    // Get user's organization
    const { data: orgUser, error: orgError } = await supabase
      .from('organization_users')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (orgError || !orgUser) {
      return createErrorResponse('No active organization access found', 403);
    }

    const organizationId = orgUser.organization_id;
    const { method } = req;

    console.log(`[${requestId}] Questions CRUD called:`, { method, userId: user.id, organizationId });

    switch (method) {
      case 'GET': {
        const { data, error } = await supabase
          .from('questions')
          .select(`
            *,
            question_options(*),
            question_scale_config(*)
          `)
          .eq('organization_id', organizationId)
          .order('order_index');
        
        if (error) {
          console.error(`[${requestId}] Database error:`, error);
          return createErrorResponse('Failed to fetch questions', 500, error);
        }

        console.log(`[${requestId}] Fetched ${data?.length || 0} questions`);
        return new Response(JSON.stringify(data || []), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'POST': {
        const rawBody = await req.json();
        console.log(`[${requestId}] POST request body:`, rawBody);
        
        // Zod validation
        const parseResult = questionSchema.safeParse(rawBody);
        if (!parseResult.success) {
          console.error(`[${requestId}] Validation error:`, parseResult.error);
          return createErrorResponse('Invalid input: ' + parseResult.error.message, 422);
        }
        const body = parseResult.data;
        
        try {
          // Validate question type and category
          const typeId = await validateQuestionType(supabase, body.question_type);
          const categoryId = await validateQuestionCategory(supabase, body.category);

          // Insert question with proper foreign keys
          const { data: question, error: questionError } = await supabase
            .from('questions')
            .insert({
              question_text: body.question_text,
              question_type: body.question_type,
              category: body.category,
              order_index: body.order_index,
              help_text: body.help_text,
              placeholder_text: body.placeholder_text,
              is_required: body.is_required || false,
              organization_id: organizationId,
              type_id: typeId,
              category_id: categoryId
            })
            .select()
            .single();
          
          if (questionError) {
            console.error(`[${requestId}] Question creation error:`, questionError);
            return createErrorResponse('Failed to create question', 500, questionError);
          }

          console.log(`[${requestId}] Created question:`, question.id);

          // Handle options
          if (body.options?.length) {
            await handleQuestionOptions(supabase, question.id, body.options);
            console.log(`[${requestId}] Added ${body.options.length} options`);
          }

          // Handle scale config
          if (body.scaleConfig) {
            await handleQuestionScale(supabase, question.id, body.scaleConfig);
            console.log(`[${requestId}] Added scale config`);
          }

          return new Response(JSON.stringify(question), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.error(`[${requestId}] Error in POST operation:`, error);
          return createErrorResponse(error.message, 500);
        }
      }

      case 'PUT': {
        const rawBody = await req.json();
        console.log(`[${requestId}] PUT request body:`, rawBody);
        
        const schemaWithId = questionSchema.extend({ id: z.string().uuid() });
        const parseResult = schemaWithId.safeParse(rawBody);
        if (!parseResult.success) {
          console.error(`[${requestId}] Validation error:`, parseResult.error);
          return createErrorResponse('Invalid input: ' + parseResult.error.message, 422);
        }
        const body = parseResult.data;
        
        if (!body.id) {
          return createErrorResponse('Question ID is required');
        }

        try {
          // Validate question type and category
          const typeId = await validateQuestionType(supabase, body.question_type);
          const categoryId = await validateQuestionCategory(supabase, body.category);

          // Prepare update data - only include fields that exist on the questions table
          const updateData = {
            question_text: body.question_text,
            question_type: body.question_type,
            category: body.category,
            order_index: body.order_index,
            help_text: body.help_text,
            placeholder_text: body.placeholder_text,
            is_required: body.is_required || false,
            type_id: typeId,
            category_id: categoryId
          };

          console.log(`[${requestId}] Updating question with data:`, updateData);

          // Update question
          const { data: question, error: updateError } = await supabase
            .from('questions')
            .update(updateData)
            .eq('id', body.id)
            .eq('organization_id', organizationId)
            .select()
            .single();
          
          if (updateError) {
            console.error(`[${requestId}] Question update error:`, updateError);
            return createErrorResponse('Failed to update question', 500, updateError);
          }

          console.log(`[${requestId}] Updated question:`, question.id);

          // Handle options update
          if (body.options !== undefined) {
            await handleQuestionOptions(supabase, body.id, body.options);
            console.log(`[${requestId}] Updated options (${body.options?.length || 0} items)`);
          }

          // Handle scale config update
          if (body.scaleConfig !== undefined) {
            await handleQuestionScale(supabase, body.id, body.scaleConfig);
            console.log(`[${requestId}] Updated scale config`);
          }

          return new Response(JSON.stringify(question), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.error(`[${requestId}] Error in PUT operation:`, error);
          return createErrorResponse(error.message, 500);
        }
      }

      case 'DELETE': {
        const { id } = await req.json();
        console.log(`[${requestId}] DELETE request for question:`, id);
        
        if (!id) {
          return createErrorResponse('Question ID is required');
        }

        try {
          // Use the safe delete function that handles responses
          const { data: deleteResult, error: deleteError } = await supabase
            .rpc('safe_delete_question', { question_uuid: id });

          if (deleteError) {
            console.error(`[${requestId}] Question deletion error:`, deleteError);
            return createErrorResponse('Failed to delete question', 500, deleteError);
          }

          const wasDeleted = deleteResult === true;
          console.log(`[${requestId}] Question ${wasDeleted ? 'deleted' : 'archived'}:`, id);

          return new Response(JSON.stringify({ 
            success: true, 
            deleted: wasDeleted,
            archived: !wasDeleted 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.error(`[${requestId}] Error in DELETE operation:`, error);
          return createErrorResponse('Failed to delete question', 500);
        }
      }

      default:
        return createErrorResponse('Method not allowed', 405);
    }
  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, error);
    return createErrorResponse('Internal server error', 500, error.message);
  }
});
