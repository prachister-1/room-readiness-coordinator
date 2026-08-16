export type ReadinessStatus = 'ready' | 'in-preparation' | 'at-risk' | 'blocked'
export type TraceStatus = 'not-started' | 'in-progress' | 'complete' | 'overdue' | 'cancelled'
export type Department = 'Housekeeping' | 'Supervisor' | 'Maintenance' | 'Front Office' | 'Coordinator'
export type Channel = 'SMS' | 'WhatsApp' | 'Email'
export type Role = 'manager' | 'housekeeper'
export type HkTaskStatus = 'complete' | 'due' | 'blocked' | 'in-progress'
export type PromisePhase = 'requested' | 'forecast' | 'confirmed' | 'at-risk' | 'verified'
export type DecisionCategory = 'arrival-risk' | 'room-allocation' | 'guest-communication' | 'policy-exception'
export type DecisionSeverity = 'critical' | 'medium' | 'policy'
export type DecisionStatus = 'open' | 'approved' | 'rejected' | 'escalated'
export type AutonomyMode = 'recommend' | 'approve' | 'bounded' | 'pause'

export interface CheckItem {
  id: string
  label: string
  complete: boolean
}

export interface Requirement {
  id: string
  label: string
  met: boolean
}

export interface TimelineEvent {
  id: string
  label: string
  time: string
  complete: boolean
}

export interface AuditEvent {
  id: string
  time: string
  actor: string
  action: string
  reason: string
}

export interface Trace {
  id: string
  caseId: string
  name: string
  department: Department
  owner: string
  status: TraceStatus
  dueTime: string
  evidence: string
  roomNumber: string
}

export interface Recommendation {
  id: string
  kind: 'assign-room' | 'reassign-trace' | 'reallocate' | 'escalate'
  title: string
  body: string
  confidence?: string
  approved?: boolean
}

export interface GuestMessage {
  status: 'sent' | 'draft' | 'blocked'
  channel: Channel
  language: string
  body: string
  safeToSend: boolean
  approvalLabel: string
}

export interface ReadinessCase {
  id: string
  guestName: string
  reservationId: string
  eta: string
  etaHour: number
  promisedCheckIn: string
  roomType: string
  roomNumber: string | null
  floor: number | null
  status: ReadinessStatus
  statusDetail: string
  verifiedAt?: string
  riskReason: string
  tasksComplete: number
  tasksTotal: number
  nextAction: string
  specialRequest: boolean
  paymentReady: boolean
  checkInReady: boolean
  whyThisRoom: string
  requirements: Requirement[]
  checks: CheckItem[]
  timeline: TimelineEvent[]
  traces: Trace[]
  recommendation?: Recommendation
  message: GuestMessage
  audit: AuditEvent[]
  inspectionCompletable?: boolean
  promise?: Partial<ArrivalPromise>
}

export interface ArrivalPromise {
  standardCheckIn: string
  requestedArrival: string
  predictedReady: string | null
  predictedConfidence: number | null
  currentPromise: string
  verifiedReadyAt: string | null
  phase: PromisePhase
}

export interface DecisionAction {
  id: string
  label: string
  kind: 'approve' | 'reject' | 'escalate' | 'other'
}

export interface DecisionItem {
  id: string
  title: string
  caseId: string
  guestName: string
  arrival: string
  impact: string
  agents: string
  confidence: number
  why: string
  policy: string
  recommendation: string
  alternatives: string[]
  actions: DecisionAction[]
  category: DecisionCategory
  severity: DecisionSeverity
  status: DecisionStatus
  autoEligible: boolean
  autoReason: string
  resolvedAt?: string
  resolvedBy?: string
  resolution?: string
}

export interface HandoverAck {
  id: string
  label: string
  caseId: string
  acknowledged: boolean
}

export interface HkTask {
  id: string
  roomNumber: string
  title: string
  action: string
  dueTime: string
  status: HkTaskStatus
  why: string
  items: string[]
  checklist: CheckItem[]
  source?: 'coordinator'
}

export interface RoomRecord {
  number: string
  type: string
  floor: number
  status: 'ready' | 'cleaning' | 'inspection' | 'blocked' | 'occupied' | 'vacant'
  note: string
  assignedTo?: string
}

export interface Toast {
  id: string
  message: string
}
