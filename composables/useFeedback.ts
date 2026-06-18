import type { FeedbackRequest, FeedbackResponse } from '../types/feedback'

/** Centraliza a chamada à server route de feedback (nunca direto ao Hygraph). */
export function useFeedback() {
  function submitFeedback(request: FeedbackRequest): Promise<FeedbackResponse> {
    return $fetch<FeedbackResponse>('/api/feedback', {
      method: 'POST',
      body: request,
    })
  }

  return { submitFeedback }
}
