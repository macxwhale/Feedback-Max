
export interface ResponseTimeData {
  sessionId: string;
  startTime: number;
  endTime?: number;
  questionTimes: Array<{
    questionId: string;
    startTime: number;
    endTime: number;
    responseTime: number;
  }>;
  totalResponseTime?: number;
}

export interface CategoryResponseTime {
  category: string;
  averageTime: number;
  totalResponses: number;
  minTime: number;
  maxTime: number;
}

class ResponseTimeService {
  private sessionTimes = new Map<string, ResponseTimeData>();

  startSession(sessionId: string): void {
    this.sessionTimes.set(sessionId, {
      sessionId,
      startTime: Date.now(),
      questionTimes: []
    });
  }

  startQuestion(sessionId: string, questionId: string): void {
    const session = this.sessionTimes.get(sessionId);
    if (!session) return;

    // End previous question if exists
    const lastQuestion = session.questionTimes[session.questionTimes.length - 1];
    if (lastQuestion && !lastQuestion.endTime) {
      lastQuestion.endTime = Date.now();
      lastQuestion.responseTime = lastQuestion.endTime - lastQuestion.startTime;
    }

    // Start new question
    session.questionTimes.push({
      questionId,
      startTime: Date.now(),
      endTime: 0,
      responseTime: 0
    });
  }

  endQuestion(sessionId: string, questionId: string): number {
    const session = this.sessionTimes.get(sessionId);
    if (!session) return 0;

    const question = session.questionTimes.find(q => q.questionId === questionId);
    if (!question || question.endTime) return question?.responseTime || 0;

    question.endTime = Date.now();
    question.responseTime = question.endTime - question.startTime;
    return question.responseTime;
  }

  endSession(sessionId: string): number {
    const session = this.sessionTimes.get(sessionId);
    if (!session) return 0;

    // End last question if not ended
    const lastQuestion = session.questionTimes[session.questionTimes.length - 1];
    if (lastQuestion && !lastQuestion.endTime) {
      lastQuestion.endTime = Date.now();
      lastQuestion.responseTime = lastQuestion.endTime - lastQuestion.startTime;
    }

    session.endTime = Date.now();
    session.totalResponseTime = session.endTime - session.startTime;
    
    return session.totalResponseTime;
  }

  getSessionTime(sessionId: string): ResponseTimeData | undefined {
    return this.sessionTimes.get(sessionId);
  }

  calculateCategoryAverages(responses: Array<{
    sessionId: string;
    questionId: string;
    category: string;
  }>): CategoryResponseTime[] {
    const categoryTimes = new Map<string, number[]>();

    responses.forEach(response => {
      const session = this.sessionTimes.get(response.sessionId);
      if (!session) return;

      const questionTime = session.questionTimes.find(q => q.questionId === response.questionId);
      if (!questionTime || !questionTime.responseTime) return;

      if (!categoryTimes.has(response.category)) {
        categoryTimes.set(response.category, []);
      }
      categoryTimes.get(response.category)!.push(questionTime.responseTime);
    });

    return Array.from(categoryTimes.entries()).map(([category, times]) => ({
      category,
      averageTime: times.reduce((sum, time) => sum + time, 0) / times.length,
      totalResponses: times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times)
    }));
  }

  clearSession(sessionId: string): void {
    this.sessionTimes.delete(sessionId);
  }
}

export const responseTimeService = new ResponseTimeService();
