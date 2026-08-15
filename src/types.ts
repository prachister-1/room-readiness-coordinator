export type ReadinessStatus = 'ready' | 'in-preparation' | 'at-risk' | 'blocked'
export type TraceStatus = 'not-started' | 'in-progress' | 'complete' | 'overdue' | 'cancelled'
export type Department = 'Housekeeping' | 'Supervisor' | 'Maintenance' | 'Front Office' | 'Coordinator'
export type Channel = 'SMS' | 'WhatsApp' | 'Email'
export type Role = 'manager' | 'housekeeper'
export type HkTaskStatus = 'complete' | 'due' | 'blocked' | 'in-progress'

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
}

export interface RoomRecord {
  number: string
  type: string
  floor: number
  status: 'ready' | 'cleaning' | 'inspection' | 'blocked' | 'occupied' | 'vacant'
  note: string
}

export interface Toast {
  id: string
  message: string
}
