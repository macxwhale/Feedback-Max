
export function validateResponse(question: any, value: any): string | null {
  if (question.required && (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0))) {
    return `Response is required for question: "${question.question}"`;
  }

  if (!question.required && (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0))) {
    return null;
  }

  switch (question.type) {
    case 'star':
    case 'nps':
    case 'slider':
    case 'likert':
    case 'emoji':
      if (typeof value !== 'number' || (question.scale && (value < question.scale.min || value > question.scale.max))) {
        return `Invalid value for question "${question.question}". Expected a number between ${question.scale.min} and ${question.scale.max}, but got ${value}.`;
      }
      break;
    
    case 'ranking':
      if (!Array.isArray(value) || !value.every(item => typeof item === 'string' && question.options.includes(item))) {
        return `Invalid value for ranking question "${question.question}". Expected an array of strings from the provided options.`;
      }
      if (value.length !== question.options.length) {
        return `Invalid value for ranking question "${question.question}". All options must be ranked.`;
      }
      break;

    case 'matrix':
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return `Invalid value for matrix question "${question.question}". Expected an object.`;
      }
      for (const subQuestion of question.options) {
        if (value[subQuestion] === undefined) {
          if (question.required) {
            return `Missing response for sub-question "${subQuestion}" in matrix question "${question.question}".`;
          }
        } else if (typeof value[subQuestion] !== 'number') {
          return `Invalid value for sub-question "${subQuestion}" in matrix question "${question.question}". Expected a number.`;
        }
      }
      break;
    
    case 'single-choice':
      if (typeof value !== 'string' || !question.options.includes(value)) {
        return `Invalid value for single-choice question "${question.question}". Expected one of the provided options.`;
      }
      break;

    case 'multi-choice':
      if (!Array.isArray(value) || !value.every(item => typeof item === 'string' && question.options.includes(item))) {
        return `Invalid value for multi-choice question "${question.question}". Expected an array of strings from the provided options.`;
      }
      break;

    case 'text':
      if (typeof value !== 'string') {
        return `Invalid value for text question "${question.question}". Expected a string.`;
      }
      break;

    default:
      console.warn(`Unknown question type "${question.type}" for question "${question.question}". Skipping validation.`);
      break;
  }

  return null;
}
