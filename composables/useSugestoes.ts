import type { RegistroAtual, SugestaoRequest, SugestaoResponse } from '../types/sugestao'

/** Centraliza as chamadas às server routes de sugestão (nunca direto ao Hygraph). */
export function useSugestoes() {
  function buscarRegistro(slug: string): Promise<RegistroAtual> {
    return $fetch<RegistroAtual>(`/api/registros/${slug}`)
  }

  function enviarSugestao(request: SugestaoRequest): Promise<SugestaoResponse> {
    return $fetch<SugestaoResponse>('/api/sugestoes', {
      method: 'POST',
      body: request,
    })
  }

  return { buscarRegistro, enviarSugestao }
}
