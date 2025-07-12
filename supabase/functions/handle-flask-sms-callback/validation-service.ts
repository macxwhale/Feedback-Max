
import { Question, ValidationResult } from './types.ts';

export function validateResponse(question: Question, userResponse: string): ValidationResult {
  const trimmedResponse = userResponse.trim()
  
  if (question.question_type === 'single-choice' && question.question_options) {
    const choiceNumber = parseInt(trimmedResponse)
    const options = question.question_options.sort((a, b) => a.display_order - b.display_order)
    
    if (isNaN(choiceNumber) || choiceNumber < 1 || choiceNumber > options.length) {
      return { 
        isValid: false, 
        value: null, 
        error: `Please reply with a number between 1 and ${options.length}` 
      }
    }
    
    return { 
      isValid: true, 
      value: options[choiceNumber - 1].option_value || options[choiceNumber - 1].option_text 
    }
  } else if (question.question_type === 'star' || question.question_type === 'nps') {
    const rating = parseInt(trimmedResponse)
    const scale = question.question_scale_config?.[0]
    
    if (scale) {
      if (isNaN(rating) || rating < scale.min_value || rating > scale.max_value) {
        return { 
          isValid: false, 
          value: null, 
          error: `Please reply with a number between ${scale.min_value} and ${scale.max_value}` 
        }
      }
    } else {
      if (isNaN(rating) || rating < 1 || rating > 5) {
        return { 
          isValid: false, 
          value: null, 
          error: 'Please reply with a number between 1 and 5' 
        }
      }
    }
    
    return { isValid: true, value: rating }
  } else if (question.question_type === 'text') {
    if (trimmedResponse.length === 0) {
      return { 
        isValid: false, 
        value: null, 
        error: 'Please provide a response' 
      }
    }
    return { isValid: true, value: trimmedResponse }
  }
  
  return { isValid: true, value: trimmedResponse }
}
