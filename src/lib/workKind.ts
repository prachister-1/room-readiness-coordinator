export type WorkKind = 'ai' | 'auto' | 'human'

export function workKindForAgent(agent: string, event = '', action = ''): WorkKind {
  const blob = `${agent} ${event} ${action}`.toLowerCase()
  if (blob.includes('duty manager') || blob.includes('human decision')) return 'human'
  if (agent === 'Housekeeping' || agent === 'Supervisor') return 'human'
  if (blob.includes('allocation') || blob.includes('exception')) return 'ai'
  if (blob.includes('task agent') || blob.includes('trace agent') || blob.includes('messaging')) return 'auto'
  if (blob.includes('coordinator')) {
    if (blob.includes('detect') || blob.includes('reason') || blob.includes('ranked') || blob.includes('flagged')) return 'ai'
    if (blob.includes('approval') || blob.includes('requested')) return 'human'
    return 'auto'
  }
  return 'auto'
}

