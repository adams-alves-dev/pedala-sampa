export function getContributionLinkState(url?: string) {
  const href = url?.trim()

  return href
    ? {
        href,
        isEnabled: true,
      }
    : {
        href: undefined,
        isEnabled: false,
      }
}
