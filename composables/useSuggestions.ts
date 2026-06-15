import type { GroupRecord, SuggestionRequest, SuggestionResponse } from '../types/suggestion'

/** Centraliza as chamadas às server routes de sugestão (nunca direto ao Hygraph). */
export function useSuggestions() {
  function fetchGroupRecord(slug: string): Promise<GroupRecord> {
    return $fetch<GroupRecord>(`/api/groups/${slug}`)
  }

  function submitSuggestion(request: SuggestionRequest): Promise<SuggestionResponse> {
    return $fetch<SuggestionResponse>('/api/suggestions', {
      method: 'POST',
      body: request,
    })
  }

  return { fetchGroupRecord, submitSuggestion }
}
