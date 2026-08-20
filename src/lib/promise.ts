import type { ArrivalPromise, PromisePhase, ReadinessCase } from '../types'

export const promisePhases: { id: PromisePhase; label: string }[] = [
  { id: 'requested', label: 'Requested' },
  { id: 'forecast', label: 'Forecast' },
  { id: 'confirmed', label: 'Confirmed promise' },
  { id: 'at-risk', label: 'At risk' },
  { id: 'verified', label: 'Verified ready' },
]

const seed: Record<string, Partial<ArrivalPromise>> = {
  olivia: {
    standardCheckIn: '15:00',
    requestedArrival: '12:30',
    predictedReady: '12:15',
    predictedConfidence: 78,
    currentPromise: 'Early check-in request acknowledged — confirmation pending',
    phase: 'requested',
  },
  maya: {
    standardCheckIn: '15:00',
    requestedArrival: '12:00',
    predictedReady: '11:50',
    predictedConfidence: 92,
    currentPromise: 'Early check-in requested — Room 412 is not ready. No guest promise sent.',
    verifiedReadyAt: null,
    phase: 'at-risk',
  },
  daniel: {
    standardCheckIn: '15:00',
    requestedArrival: '15:00',
    predictedReady: '14:42',
    predictedConfidence: 92,
    currentPromise: 'Standard arrival — no early promise made',
    phase: 'forecast',
  },
  sofia: {
    standardCheckIn: '15:00',
    requestedArrival: '14:00',
    predictedReady: '13:56',
    predictedConfidence: 71,
    currentPromise: '14:00 arrival still the hotel promise — inspection at risk',
    phase: 'at-risk',
  },
  samira: {
    standardCheckIn: '15:00',
    requestedArrival: '16:30',
    predictedReady: '16:10',
    predictedConfidence: 89,
    currentPromise: 'Accessible room required — no automatic confirmation',
    phase: 'at-risk',
  },
  james: {
    standardCheckIn: '15:00',
    requestedArrival: '13:45',
    predictedReady: '13:50',
    predictedConfidence: 64,
    currentPromise: 'Standard arrival under late-checkout pressure',
    phase: 'at-risk',
  },
}

export function confidenceBand(n: number | null) {
  if (n == null) return null
  if (n >= 85) return { label: 'High confidence', tone: 'ready' as const }
  if (n >= 60) return { label: 'Medium confidence', tone: 'risk' as const }
  return { label: 'Low confidence', tone: 'blocked' as const }
}

export function getPromise(c: ReadinessCase): ArrivalPromise {
  const s = seed[c.id] ?? {}
  const base: ArrivalPromise = {
    standardCheckIn: s.standardCheckIn ?? '15:00',
    requestedArrival: s.requestedArrival ?? c.eta,
    predictedReady: s.predictedReady ?? null,
    predictedConfidence: s.predictedConfidence ?? null,
    currentPromise: s.currentPromise ?? 'Standard check-in unless a promise is confirmed',
    verifiedReadyAt: s.verifiedReadyAt ?? c.verifiedAt ?? null,
    phase: s.phase ?? 'forecast',
  }
  const merged = c.promise ? { ...base, ...c.promise } : base
  if (c.status === 'ready' && (c.verifiedAt || merged.verifiedReadyAt)) {
    const at = c.verifiedAt ?? merged.verifiedReadyAt
    return {
      ...merged,
      verifiedReadyAt: at,
      phase: 'verified',
      currentPromise: `Verified ready at ${at}`,
    }
  }
  if (!c.promise && (c.status === 'at-risk' || c.status === 'blocked')) {
    return { ...merged, phase: 'at-risk' }
  }
  return merged
}
