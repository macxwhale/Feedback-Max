import { ConversationProgress, Question } from './types.ts';
import { getOrganizationQuestions, formatQuestionForSms } from './question-service.ts';
import { validateResponse } from './validation-service.ts';

export async function handleConversationStep(
  supabase: any,
  progress: ConversationProgress,
  text: string,
  org: any
): Promise<{ nextStep: string; responseMessage: string; sessionData: any }> {
  let nextStep = progress.current_step
  let responseMessage = ''
  let sessionData = { ...progress.session_data }

  switch (progress.current_step) {
    case 'consent':
      const consentResponse = text.toLowerCase().trim()
      if (consentResponse === '1' || consentResponse === 'yes' || consentResponse === 'y') {
        // Get first question
        const questions = await getOrganizationQuestions(supabase, org.id)
        if (questions.length > 0) {
          nextStep = 'question_0'
          sessionData.consent_given = true
          sessionData.questions = questions
          sessionData.current_question_index = 0
          sessionData.responses = {}
          
          // Create feedback session with SMS origin
          const { data: feedbackSession, error: sessionError } = await supabase
            .from('feedback_sessions')
            .insert({
              organization_id: org.id,
              phone_number: progress.phone_number,
              status: 'in_progress',
              metadata: { 
                origin: 'sms',
                sender_id: progress.sender_id,
                session_id: progress.id
              }
            })
            .select()
            .single()

          if (!sessionError) {
            sessionData.feedback_session_id = feedbackSession.id
          }

          responseMessage = formatQuestionForSms(questions[0], 1)
        } else {
          responseMessage = 'Thank you for your interest! We currently have no questions available.'
          nextStep = 'completed'
        }
      } else {
        responseMessage = 'Thank you for your time. Have a great day!'
        nextStep = 'completed'
      }
      break

    case 'question_0':
    case 'question_1':
    case 'question_2':
    case 'question_3':
    case 'question_4':
    case 'question_5':
    case 'question_6':
    case 'question_7':
    case 'question_8':
    case 'question_9':
      // Extract current question index
      const currentQuestionIndex = parseInt(progress.current_step.replace('question_', ''))
      const questions = sessionData.questions || []
      
      if (currentQuestionIndex < questions.length) {
        const currentQuestion = questions[currentQuestionIndex]
        const validation = validateResponse(currentQuestion, text)
        
        if (!validation.isValid) {
          responseMessage = validation.error + '\n\n' + formatQuestionForSms(currentQuestion, currentQuestionIndex + 1)
          // Don't change step, keep asking the same question
        } else {
          // Store the response
          sessionData.responses = sessionData.responses || {}
          sessionData.responses[currentQuestion.id] = validation.value
          
          // Save response to database
          if (sessionData.feedback_session_id) {
            await supabase
              .from('feedback_responses')
              .insert({
                session_id: sessionData.feedback_session_id,
                organization_id: org.id,
                question_id: currentQuestion.id,
                question_category: currentQuestion.category || 'QualityService',
                response_value: validation.value,
                score: typeof validation.value === 'number' ? validation.value : null,
                question_snapshot: {
                  id: currentQuestion.id,
                  question_text: currentQuestion.question_text,
                  question_type: currentQuestion.question_type,
                  category: currentQuestion.category,
                  options: currentQuestion.question_options,
                  scale: currentQuestion.question_scale_config
                }
              })
          }
          
          // Move to next question or complete
          const nextQuestionIndex = currentQuestionIndex + 1
          if (nextQuestionIndex < questions.length) {
            nextStep = `question_${nextQuestionIndex}`
            responseMessage = formatQuestionForSms(questions[nextQuestionIndex], nextQuestionIndex + 1)
          } else {
            nextStep = 'completed'
            
            // Complete feedback session
            if (sessionData.feedback_session_id) {
              const totalScore = Object.values(sessionData.responses)
                .filter(r => typeof r === 'number')
                .reduce((sum: number, score: any) => sum + score, 0)
              
              await supabase
                .from('feedback_sessions')
                .update({
                  status: 'completed',
                  completed_at: new Date().toISOString(),
                  total_score: totalScore || null
                })
                .eq('id', sessionData.feedback_session_id)
            }
            
            responseMessage = `Thank you for your valuable feedback! Your responses have been recorded. - ${org.name}`
          }
        }
      } else {
        nextStep = 'completed'
        responseMessage = 'Thank you for your feedback!'
      }
      break

    default:
      responseMessage = `Hi! We'd love your feedback on our service. 

Please reply with:
1. Yes  
2. No

Your input helps us improve. 
Thank you! – ${org.name}`
      nextStep = 'consent'
      break
  }

  return { nextStep, responseMessage, sessionData }
}
