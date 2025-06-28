
import { Question } from './types.ts';

export async function getOrganizationQuestions(supabase: any, organizationId: string): Promise<Question[]> {
  const { data: questions, error } = await supabase
    .from('questions')
    .select(`
      id,
      question_text,
      question_type,
      is_required,
      order_index,
      category,
      question_options (
        id,
        option_text,
        option_value,
        display_order
      ),
      question_scale_config (
        min_value,
        max_value,
        min_label,
        max_label
      )
    `)
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching questions:', error)
    return []
  }

  return questions || []
}

export function formatQuestionForSms(question: Question, questionNumber: number): string {
  let message = `Q${questionNumber}: ${question.question_text}\n\n`
  
  if (question.question_type === 'single-choice' && question.question_options) {
    question.question_options
      .sort((a, b) => a.display_order - b.display_order)
      .forEach((option, index) => {
        message += `${index + 1}. ${option.option_text}\n`
      })
    message += '\nReply with the number of your choice.'
  } else if (question.question_type === 'star' || question.question_type === 'nps') {
    const scale = question.question_scale_config?.[0]
    if (scale) {
      message += `Rate from ${scale.min_value} to ${scale.max_value}\n`
      if (scale.min_label) message += `${scale.min_value} = ${scale.min_label}\n`
      if (scale.max_label) message += `${scale.max_value} = ${scale.max_label}\n`
    }
    message += '\nReply with a number.'
  } else if (question.question_type === 'text') {
    message += 'Please type your response.'
  }
  
  return message
}
