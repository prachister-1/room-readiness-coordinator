import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react'
import { hkTasks as seedTasks, initialCases, KIARA_READY_MESSAGE, rooms as seedRooms } from '../data/mock'
import { initialDecisions, initialHandoverAcks } from '../data/decisions'
import type { AutonomyMode, DecisionItem, HandoverAck, HkTask, ReadinessCase, Role, RoomRecord, Toast } from '../types'

interface State {
  cases: ReadinessCase[]
  hkTasks: HkTask[]
  rooms: RoomRecord[]
  decisions: DecisionItem[]
  handoverAcks: HandoverAck[]
  toasts: Toast[]
  selectedCaseId: string | null
  search: string
  role: Role
  chooseRoomFor: string | null
  flagTaskId: string | null
  autonomyMode: AutonomyMode
  automatedToday: number
}

type Action =
  | { type: 'select'; id: string | null }
  | { type: 'search'; q: string }
  | { type: 'role'; role: Role }
  | { type: 'toast'; message: string }
  | { type: 'dismiss-toast'; id: string }
  | { type: 'patch-case'; id: string; patch: Partial<ReadinessCase> }
  | { type: 'choose-room'; id: string | null }
  | { type: 'flag-task'; id: string | null }
  | { type: 'patch-task'; id: string; patch: Partial<HkTask> }
  | { type: 'upsert-task'; task: HkTask }
  | { type: 'patch-room'; number: string; patch: Partial<RoomRecord> }
  | { type: 'patch-decision'; id: string; patch: Partial<DecisionItem> }
  | { type: 'patch-ack'; id: string | 'all' }
  | { type: 'autonomy'; mode: AutonomyMode }
  | { type: 'automated'; n?: number }

const now = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })

let toastSeq = 1
let auditSeq = 1

function addAudit(c: ReadinessCase, action: string, reason: string, actor = 'Alex Morgan'): ReadinessCase {
  return {
    ...c,
    audit: [...c.audit, { id: `a-${auditSeq++}`, time: now(), actor, action, reason }],
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'select':
      return { ...state, selectedCaseId: action.id }
    case 'search':
      return { ...state, search: action.q }
    case 'role':
      return { ...state, role: action.role }
    case 'toast':
      return {
        ...state,
        toasts: [...state.toasts, { id: `t-${toastSeq++}`, message: action.message }],
      }
    case 'dismiss-toast':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) }
    case 'choose-room':
      return { ...state, chooseRoomFor: action.id }
    case 'flag-task':
      return { ...state, flagTaskId: action.id }
    case 'patch-case':
      return {
        ...state,
        cases: state.cases.map((c) => (c.id === action.id ? { ...c, ...action.patch } : c)),
      }
    case 'patch-task':
      return {
        ...state,
        hkTasks: state.hkTasks.map((t) => (t.id === action.id ? { ...t, ...action.patch } : t)),
      }
    case 'upsert-task': {
      const exists = state.hkTasks.some((t) => t.id === action.task.id)
      return {
        ...state,
        hkTasks: exists
          ? state.hkTasks.map((t) => (t.id === action.task.id ? action.task : t))
          : [action.task, ...state.hkTasks],
      }
    }
    case 'patch-room':
      return {
        ...state,
        rooms: state.rooms.map((r) => (r.number === action.number ? { ...r, ...action.patch } : r)),
      }
    case 'patch-decision':
      return {
        ...state,
        decisions: state.decisions.map((d) => (d.id === action.id ? { ...d, ...action.patch } : d)),
      }
    case 'patch-ack':
      return {
        ...state,
        handoverAcks: state.handoverAcks.map((a) =>
          action.id === 'all' || a.id === action.id ? { ...a, acknowledged: true } : a,
        ),
      }
    case 'autonomy':
      return { ...state, autonomyMode: action.mode }
    case 'automated':
      return { ...state, automatedToday: state.automatedToday + (action.n ?? 1) }
    default:
      return state
  }
}

interface StoreValue extends State {
  selected: ReadinessCase | null
  select: (id: string | null) => void
  setSearch: (q: string) => void
  setRole: (role: Role) => void
  toast: (message: string) => void
  dismissToast: (id: string) => void
  approveSofia: () => void
  completeSofiaInspection: () => void
  sendReadyMessage: (id: string) => void
  chooseAnotherRoom: () => void
  assignSofiaRoom: (room: string) => void
  escalateSofia: () => void
  approveDaniel: () => void
  keepDaniel: () => void
  contactDaniel: () => void
  approveMaya: () => void
  keepMaya: () => void
  completeMayaCot: () => void
  completeMayaInspection: () => void
  assignOlivia: () => void
  startTask: (id: string) => void
  completeTask: (id: string) => void
  submitFlag: (reason: string) => void
  updateMessage: (id: string, patch: Partial<ReadinessCase['message']>) => void
  sendDraft: (id: string) => void
  resolveDecision: (id: string, actionId: string) => void
  oliviaPromiseAction: (kind: 'expect' | 'conditional' | 'wait' | 'escalate') => void
  verifyOliviaReady: () => void
  approveSamira: () => void
  ackHandover: (id: string) => void
  ackAllHandover: () => void
  setAutonomyMode: (mode: AutonomyMode) => void
  runBoundedAutomation: () => void
  writesAllowed: boolean
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    cases: initialCases,
    hkTasks: seedTasks,
    rooms: seedRooms,
    decisions: initialDecisions,
    handoverAcks: initialHandoverAcks,
    toasts: [],
    selectedCaseId: null,
    search: '',
    role: 'manager' as Role,
    chooseRoomFor: null,
    flagTaskId: null,
    autonomyMode: 'approve' as AutonomyMode,
    automatedToday: 42,
  })

  const selected = state.cases.find((c) => c.id === state.selectedCaseId) ?? null

  const value = useMemo<StoreValue>(() => {
    const toast = (message: string) => dispatch({ type: 'toast', message })
    const patch = (id: string, next: (c: ReadinessCase) => ReadinessCase) => {
      const current = state.cases.find((c) => c.id === id)
      if (!current) return
      dispatch({ type: 'patch-case', id, patch: next(current) })
    }
    const upsertTask = (task: HkTask) => dispatch({ type: 'upsert-task', task })
    const patchRoom = (number: string, roomPatch: Partial<RoomRecord>) =>
      dispatch({ type: 'patch-room', number, patch: roomPatch })
    const closeDecision = (id: string, status: DecisionItem['status'], resolution: string) =>
      dispatch({
        type: 'patch-decision',
        id,
        patch: { status, resolution, resolvedAt: now(), resolvedBy: 'Alex Morgan' },
      })
    let bypassGuard = false
    const writesAllowed = state.autonomyMode === 'approve' || state.autonomyMode === 'bounded'
    const guardWrite = () => {
      if (bypassGuard || writesAllowed) return true
      toast(
        state.autonomyMode === 'pause'
          ? 'Automation paused. No writes to Mews.'
          : 'Recommend only. Agents proposed; staff execute in Mews.',
      )
      return false
    }

    const api: StoreValue = {
      ...state,
      selected,
      select: (id) => dispatch({ type: 'select', id }),
      setSearch: (q) => dispatch({ type: 'search', q }),
      setRole: (role) => dispatch({ type: 'role', role }),
      toast,
      dismissToast: (id) => dispatch({ type: 'dismiss-toast', id }),
      writesAllowed,
      approveSofia: () => {
        if (!guardWrite()) return
        patch('sofia', (c) =>
          addAudit(
            {
              ...c,
              status: 'in-preparation',
              statusDetail: 'Inspection reassigned to Priya S.',
              riskReason: 'Inspection in progress on Floor 2',
              nextAction: 'Mark inspection complete',
              inspectionCompletable: true,
              traces: c.traces.map((t) =>
                t.name.includes('inspection')
                  ? { ...t, owner: 'Priya S.', status: 'in-progress', evidence: 'Reassigned · walking Floor 2', dueTime: '13:56' }
                  : t,
              ),
              recommendation: c.recommendation ? { ...c.recommendation, approved: true } : undefined,
            },
            'Reassigned final inspection',
            'Priya S. available on Floor 2; expected ready 13:56',
            'Alex Morgan',
          ),
        )
        patchRoom('225', {
          status: 'inspection',
          note: 'Inspection reassigned to Priya S. for Sofia Garcia',
          assignedTo: 'Sofia Garcia',
        })
        upsertTask({
          id: 'hk-225',
          roomNumber: '225',
          title: 'Final inspection after failed checks',
          action: 'Re-inspect minibar replenishment and bathroom before releasing the room.',
          dueTime: '13:56',
          status: 'due',
          why: 'Coordinator reassigned Sofia Garcia’s inspection to Priya S. after the first pass failed.',
          items: ['Minibar restock proof', 'Bathroom recheck', 'Inspection card'],
          checklist: [
            { id: 'c1', label: 'Minibar replenished', complete: false },
            { id: 'c2', label: 'Bathroom issue cleared', complete: false },
            { id: 'c3', label: 'Supervisor sign-off', complete: false },
          ],
          source: 'coordinator',
        })
        toast('Inspection reassigned. New trace is on Housekeeping and Room 225.')
        closeDecision('d-sofia', 'approved', 'Inspection reassigned to Priya S.')
        dispatch({ type: 'automated' })
      },
      completeSofiaInspection: () => {
        patch('sofia', (c) =>
          addAudit(
            {
              ...c,
              status: 'ready',
              statusDetail: `Verified at ${now()}`,
              verifiedAt: now(),
              riskReason: 'Inspection passed',
              tasksComplete: 4,
              nextAction: 'Send room ready message',
              inspectionCompletable: false,
              checks: c.checks.map((k) => ({ ...k, complete: true })),
              timeline: c.timeline.map((t) =>
                t.label.toLowerCase().includes('inspection') || t.label.toLowerCase().includes('verified')
                  ? { ...t, time: now(), complete: true }
                  : t,
              ),
              traces: c.traces.map((t) =>
                t.name.includes('inspection')
                  ? { ...t, status: 'complete', evidence: 'Inspection passed', owner: 'Priya S.' }
                  : t,
              ),
              message: {
                ...c.message,
                safeToSend: true,
                approvalLabel: 'Safe to send: readiness verified',
                body: 'Hi Sofia, your room is ready. You can complete check-in now and collect your key from reception.',
              },
            },
            'Inspection passed',
            'Priya S. verified Room 225 against SOP',
            'Priya S.',
          ),
        )
        patchRoom('225', {
          status: 'ready',
          note: 'Verified ready for Sofia Garcia',
          assignedTo: 'Sofia Garcia',
        })
        dispatch({
          type: 'patch-task',
          id: 'hk-225',
          patch: {
            status: 'complete',
            checklist: [
              { id: 'c1', label: 'Minibar replenished', complete: true },
              { id: 'c2', label: 'Bathroom issue cleared', complete: true },
              { id: 'c3', label: 'Supervisor sign-off', complete: true },
            ],
          },
        })
        toast('Room 225 verified ready. Room-ready message is now unlocked.')
      },
      sendReadyMessage: (id) => {
        if (!guardWrite()) return
        patch(id, (c) => {
          if (!c.checks.every((k) => k.complete) && c.status !== 'ready') return c
          return addAudit(
            {
              ...c,
              nextAction: 'Guest notified',
              message: { ...c.message, status: 'sent', safeToSend: true, approvalLabel: 'Safe to send: readiness verified' },
              timeline: c.timeline.some((t) => /guest (message|informed)/i.test(t.label))
                ? c.timeline.map((t) =>
                    /guest (message|informed)/i.test(t.label) ? { ...t, complete: true, time: now() } : t,
                  )
                : [...c.timeline, { id: 'msg', label: 'Guest informed', time: now(), complete: true }],
            },
            'Sent room-ready message',
            'All required room-readiness checks complete',
            'Alex Morgan',
          )
        })
        toast('Room-ready message sent.')
      },
      chooseAnotherRoom: () => dispatch({ type: 'choose-room', id: 'sofia' }),
      assignSofiaRoom: (room) => {
        patch('sofia', (c) =>
          addAudit(
            {
              ...c,
              roomNumber: room,
              status: 'in-preparation',
              statusDetail: `Reallocated to Room ${room}`,
              nextAction: 'Verify Room ' + room,
              inspectionCompletable: false,
              traces: [
                ...c.traces.map((t) =>
                  t.status === 'complete' ? t : { ...t, status: 'cancelled' as const, evidence: 'Closed — room no longer assigned', roomNumber: '225' },
                ),
                {
                  id: `tr-${room}-inspect`,
                  caseId: 'sofia',
                  name: `Room ${room} arrival inspection`,
                  department: 'Supervisor' as const,
                  owner: 'Priya S.',
                  status: 'in-progress' as const,
                  dueTime: '13:50',
                  evidence: 'Copied remaining inspection requirement',
                  roomNumber: room,
                },
              ],
            },
            'Chose alternative room',
            `Operator selected Room ${room} instead of reassigning inspection`,
          ),
        )
        patchRoom('225', { note: 'Released from Sofia Garcia after reallocation', assignedTo: undefined })
        patchRoom(room, {
          status: 'inspection',
          note: `Assigned to Sofia Garcia · verification still required`,
          assignedTo: 'Sofia Garcia',
        })
        upsertTask({
          id: `hk-${room}`,
          roomNumber: room,
          title: 'Arrival inspection after reallocation',
          action: `Confirm Room ${room} is inspection-ready for Sofia Garcia.`,
          dueTime: '13:50',
          status: 'due',
          why: `Coordinator moved Sofia Garcia from 225 to ${room}. Copy only the remaining inspection requirement.`,
          items: ['Arrival inspection', 'Amenity check'],
          checklist: [
            { id: 'c1', label: 'Room inspected', complete: false },
            { id: 'c2', label: 'Amenities confirmed', complete: false },
          ],
          source: 'coordinator',
        })
        dispatch({ type: 'choose-room', id: null })
        toast(`Sofia Garcia reallocated to Room ${room}. New traces are on Housekeeping and Rooms.`)
      },
      escalateSofia: () => {
        patch('sofia', (c) =>
          addAudit(
            { ...c, nextAction: 'Duty manager owns recovery' },
            'Escalated to duty manager',
            'Inspection window too tight; human recovery requested',
          ),
        )
        toast('Duty manager notified with Sofia Garcia’s evidence packet.')
        closeDecision('d-sofia', 'escalated', 'Duty manager owns Sofia Garcia’s recovery.')
      },
      approveDaniel: () => {
        if (!guardWrite()) return
        patch('daniel', (c) =>
          addAudit(
            {
              ...c,
              roomNumber: '510',
              floor: 5,
              status: 'in-preparation',
              statusDetail: 'Reallocated to Suite 510 · preparing, not yet verified',
              riskReason: 'Suite 510 being prepared',
              tasksComplete: 2,
              tasksTotal: 4,
              nextAction: 'Verify Suite 510 before guest message',
              whyThisRoom:
                'Room 510 matches the booked Suite category, is inspected, has no maintenance issues, and can be prepared before Daniel’s promised arrival. Reassigning now avoids a likely missed check-in promise.',
              checks: c.checks.map((k) =>
                k.id === 'k1' ? { ...k, complete: true } : { ...k, complete: k.id === 'k4' ? true : false },
              ),
              traces: [
                { ...c.traces[0], status: 'cancelled', evidence: 'Closed — room no longer assigned', roomNumber: '507' },
                { ...c.traces[1], status: 'cancelled', evidence: 'Closed — room no longer assigned', roomNumber: '507' },
                {
                  id: 'tr-510-amenity',
                  caseId: 'daniel',
                  name: 'Suite 510 amenity and handover prep',
                  department: 'Housekeeping',
                  owner: 'Anna K.',
                  status: 'in-progress',
                  dueTime: '14:10',
                  evidence: 'Copied relevant suite setup from 507',
                  roomNumber: '510',
                },
                {
                  id: 'tr-510-inspect',
                  caseId: 'daniel',
                  name: 'Suite 510 handover check',
                  department: 'Supervisor',
                  owner: 'Priya S.',
                  status: 'not-started',
                  dueTime: '14:20',
                  evidence: 'Blocked on housekeeping handover',
                  roomNumber: '510',
                },
              ],
              recommendation: c.recommendation ? { ...c.recommendation, approved: true } : undefined,
              message: {
                ...c.message,
                status: 'draft',
                safeToSend: false,
                approvalLabel: 'Awaiting operational confirmation',
                body: 'Hi Daniel, we are preparing everything for your arrival this afternoon. We’ll notify you as soon as your suite is ready for check-in.',
              },
            },
            'Approved reallocation 507 → 510',
            '510 matches Suite, inspected, no maintenance; 507 bathroom still blocked',
          ),
        )
        patchRoom('507', {
          status: 'blocked',
          note: 'Bathroom leak · released from Daniel Kim',
          assignedTo: undefined,
        })
        patchRoom('510', {
          status: 'inspection',
          note: 'Assigned to Daniel Kim · handover in progress',
          assignedTo: 'Daniel Kim',
        })
        upsertTask({
          id: 'hk-510',
          roomNumber: '510',
          title: 'Suite handover after blocked-room move',
          action: 'Copy suite amenities to 510 and leave it ready for supervisor inspection.',
          dueTime: '14:10',
          status: 'due',
          why: 'Coordinator reallocated Daniel Kim from blocked 507 to inspected Suite 510. Only relevant prep was copied.',
          items: ['Suite amenities', 'Welcome kit', 'Handover card'],
          checklist: [
            { id: 'c1', label: 'Suite amenities set', complete: false },
            { id: 'c2', label: 'Bathroom verified dry', complete: false },
            { id: 'c3', label: 'Ready for supervisor inspect', complete: false },
          ],
          source: 'coordinator',
        })
        toast('Daniel Kim moved to 510. New housekeeping trace and holding guest message are live.')
        closeDecision('d-daniel', 'approved', 'Reallocated 507 → 510. Task Agent copied relevant prep.')
      },
      keepDaniel: () => {
        patch('daniel', (c) =>
          addAudit(
            { ...c, nextAction: 'Maintenance escalated · keep 507' },
            'Kept Room 507',
            'Escalated bathroom maintenance; allocation unchanged',
          ),
        )
        toast('Maintenance escalated for Room 507. Allocation unchanged.')
        closeDecision('d-daniel', 'rejected', 'Kept Room 507. Maintenance escalated.')
      },
      contactDaniel: () => {
        dispatch({ type: 'select', id: 'daniel' })
        toast('Opened Daniel Kim’s case with the holding message draft.')
      },
      approveMaya: () => {
        if (!guardWrite()) return
        patch('maya', (c) =>
          addAudit(
            {
              ...c,
              roomNumber: '418',
              floor: 4,
              status: 'in-preparation',
              statusDetail: 'Moved to Room 418 · cot and inspection still required',
              riskReason: '418 held and assigned · cot not yet verified',
              tasksComplete: 2,
              tasksTotal: 4,
              nextAction: 'Install cot, then inspect',
              whyThisRoom:
                'Room 418 matches the booked Deluxe King, is already clean, was unassigned, can take a cot, and has no downstream conflict. Cleaning is complete; cot and inspection still block any guest-ready message.',
              requirements: c.requirements.map((r) =>
                r.id === 'r1' ? { ...r, met: true } : r,
              ),
              checks: c.checks.map((k) => (k.id === 'k1' ? { ...k, complete: true } : k)),
              timeline: c.timeline.map((t) =>
                t.id === 't4' ? { ...t, time: now(), complete: true } : t,
              ),
              traces: [
                { ...c.traces[0], status: 'cancelled', evidence: 'Closed for this guest — 412 returned to inventory', roomNumber: '412' },
                {
                  id: 'tr-418-cot',
                  caseId: 'maya',
                  name: 'Cot delivery',
                  department: 'Housekeeping',
                  owner: 'Anna K.',
                  status: 'in-progress',
                  dueTime: '11:50',
                  evidence: 'Copied to 418 after approval',
                  roomNumber: '418',
                },
                { ...c.traces[2], evidence: '418 now assigned to Kiara Garcia', roomNumber: '418' },
                {
                  id: 'tr-418-inspect',
                  caseId: 'maya',
                  name: 'Final room inspection',
                  department: 'Supervisor',
                  owner: 'Priya S.',
                  status: 'not-started',
                  dueTime: '11:55',
                  evidence: 'Blocked on cot setup',
                  roomNumber: '418',
                },
              ],
              recommendation: c.recommendation ? { ...c.recommendation, approved: true } : undefined,
              message: {
                ...c.message,
                status: 'draft',
                safeToSend: false,
                approvalLabel: 'Awaiting operational confirmation',
              },
            },
            'Approved room change 412 → 418',
            '418 same category, ready now, cot possible, no downstream conflict',
          ),
        )
        patchRoom('412', {
          status: 'cleaning',
          note: 'Released from Kiara Garcia · dirty turn continues for inventory',
          assignedTo: undefined,
        })
        patchRoom('418', {
          status: 'inspection',
          note: 'Assigned to Kiara Garcia · cot pending, then inspect',
          assignedTo: 'Kiara Garcia',
        })
        upsertTask({
          id: 'hk-cot',
          roomNumber: '418',
          title: 'Deliver cot and verify setup',
          action: 'Install the travel cot in Room 418, lock the wheels, and photograph the setup.',
          dueTime: '11:50',
          status: 'due',
          why: 'Duty manager moved Kiara Garcia from dirty 412 to clean 418. Cot must be verified before inspection and before any guest-ready message.',
          items: ['Travel cot', 'Cot linen', 'Safety card'],
          checklist: [
            { id: 'c1', label: 'Cot assembled', complete: false },
            { id: 'c2', label: 'Linen fitted', complete: false },
            { id: 'c3', label: 'Photo uploaded', complete: false },
          ],
          source: 'coordinator',
        })
        toast('Kiara Garcia moved to 418. Cot task is on Housekeeping. Guest-ready message stays locked.')
        closeDecision('d-maya', 'approved', 'Moved 412 → 418. Cot and inspection still required.')
      },
      keepMaya: () => {
        patch('maya', (c) =>
          addAudit(
            { ...c, nextAction: 'Rush clean 412 · cot still required' },
            'Kept Room 412',
            'Duty manager declined the 418 move; 412 turn stays the plan',
          ),
        )
        toast('Kept Room 412. Priority clean and cot stay on 412. Guest-ready message stays locked.')
        closeDecision('d-maya', 'rejected', 'Kept Room 412. Rush clean continues.')
      },
      completeMayaCot: () => {
        const current = state.cases.find((c) => c.id === 'maya')
        if (current?.checks.find((k) => k.id === 'k2')?.complete) return
        patch('maya', (c) => {
          if (c.checks.find((k) => k.id === 'k2')?.complete) return c
          return addAudit(
            {
              ...c,
              inspectionCompletable: true,
              nextAction: 'Complete inspection',
              tasksComplete: Math.min(c.tasksTotal, c.tasksComplete + 1),
              requirements: c.requirements.map((r) => (r.id === 'r2' ? { ...r, met: true } : r)),
              checks: c.checks.map((k) => (k.id === 'k2' ? { ...k, complete: true } : k)),
              timeline: c.timeline.map((t) => (t.id === 't5' ? { ...t, time: now(), complete: true } : t)),
              traces: c.traces.map((t) =>
                t.name.toLowerCase().includes('cot')
                  ? { ...t, status: 'complete', evidence: 'Cot installed · photo attached', roomNumber: c.roomNumber ?? t.roomNumber }
                  : t.name.toLowerCase().includes('inspection')
                    ? { ...t, status: 'in-progress', evidence: 'Unblocked — cot complete', owner: 'Priya S.' }
                    : t,
              ),
            },
            'Cot installed',
            `Travel cot verified in Room ${c.roomNumber}`,
            'Anna K.',
          )
        })
        dispatch({
          type: 'patch-task',
          id: 'hk-cot',
          patch: {
            status: 'complete',
            checklist: [
              { id: 'c1', label: 'Cot assembled', complete: true },
              { id: 'c2', label: 'Linen fitted', complete: true },
              { id: 'c3', label: 'Photo uploaded', complete: true },
            ],
          },
        })
        toast('Cot verified. Inspection can start. Guest-ready message stays locked.')
      },
      completeMayaInspection: () => {
        patch('maya', (c) =>
          addAudit(
            {
              ...c,
              status: 'ready',
              statusDetail: `Verified at ${now()}`,
              verifiedAt: now(),
              riskReason: '418 verified ready',
              tasksComplete: 4,
              nextAction: 'Send room ready message',
              inspectionCompletable: false,
              checks: c.checks.map((k) => ({ ...k, complete: true })),
              timeline: c.timeline.map((t) =>
                t.id === 't6' || t.id === 't7' ? { ...t, time: now(), complete: true } : t,
              ),
              traces: c.traces.map((t) =>
                t.status === 'cancelled'
                  ? t
                  : { ...t, status: 'complete', evidence: t.evidence.includes('Closed') ? t.evidence : 'Verified' },
              ),
              promise: {
                standardCheckIn: '15:00',
                requestedArrival: '12:00',
                predictedReady: '11:50',
                predictedConfidence: 92,
                currentPromise: `Verified ready at ${now()}`,
                verifiedReadyAt: now(),
                phase: 'verified',
              },
              message: {
                ...c.message,
                status: 'draft',
                safeToSend: true,
                approvalLabel: 'Safe to send: readiness verified',
                body: KIARA_READY_MESSAGE,
              },
            },
            'Inspection passed',
            'Cleaning, cot, inspection, and payment all verified on 418',
            'Priya S.',
          ),
        )
        patchRoom('418', { status: 'ready', note: 'Verified ready for Kiara Garcia', assignedTo: 'Kiara Garcia' })
        toast('Room 418 verified ready. Room-ready message is now unlocked.')
      },
      assignOlivia: () => {
        if (!guardWrite()) return
        patch('olivia', (c) =>
          addAudit(
            {
              ...c,
              roomNumber: '416',
              floor: 4,
              status: 'in-preparation',
              statusDetail: 'Room 416 assigned · early-arrival turn in progress',
              riskReason: 'Early arrival · 416 assigned',
              tasksComplete: 1,
              nextAction: 'Complete 416 turn, then inspect',
              checks: c.checks.map((k) => (k.id === 'k1' ? { ...k, complete: true } : k)),
              timeline: c.timeline.map((t) =>
                t.label.toLowerCase().includes('allocation') ? { ...t, time: now(), complete: true } : t,
              ),
              traces: [
                {
                  id: 'tr-416-clean',
                  caseId: 'olivia',
                  name: 'Early-arrival priority clean',
                  department: 'Housekeeping',
                  owner: 'Anna K.',
                  status: 'in-progress',
                  dueTime: '12:05',
                  evidence: 'Dispatched to Floor 4',
                  roomNumber: '416',
                },
                {
                  id: 'tr-416-inspect',
                  caseId: 'olivia',
                  name: 'Supervisor inspection',
                  department: 'Supervisor',
                  owner: 'Priya S.',
                  status: 'not-started',
                  dueTime: '12:20',
                  evidence: 'Blocked on clean',
                  roomNumber: '416',
                },
              ],
              recommendation: c.recommendation ? { ...c.recommendation, approved: true } : undefined,
              message: bypassGuard
                ? {
                    ...c.message,
                    status: 'sent',
                    safeToSend: false,
                    approvalLabel: 'Expectation-setting only — not a ready promise',
                    body: 'Hi Olivia, we have received your 12:30 arrival request. We will confirm as soon as a matching room has passed inspection. We cannot promise the room is ready yet.',
                  }
                : {
                    ...c.message,
                    status: 'draft',
                    safeToSend: false,
                    approvalLabel: 'Awaiting operational confirmation',
                    body: 'Hi Olivia, we have a matching room in preparation for your 12:30 arrival. We’ll message you as soon as it is verified ready.',
                  },
              promise: bypassGuard
                ? {
                    standardCheckIn: '15:00',
                    requestedArrival: '12:30',
                    predictedReady: '12:15',
                    predictedConfidence: 78,
                    currentPromise: 'Expectation set — early arrival acknowledged, readiness not confirmed',
                    verifiedReadyAt: null,
                    phase: 'forecast',
                  }
                : {
                    standardCheckIn: '15:00',
                    requestedArrival: '12:30',
                    predictedReady: '12:15',
                    predictedConfidence: 78,
                    currentPromise: 'Early check-in request acknowledged — confirmation pending',
                    verifiedReadyAt: null,
                    phase: 'forecast',
                  },
              whyThisRoom:
                'Room 416 is an inspected Standard Double that can support a 12:30 early arrival. Ready is still locked until the turn and inspection verify.',
            },
            'Assigned Room 416',
            'Inspected Standard Double supporting 12:30 early arrival',
          ),
        )
        patchRoom('416', {
          status: 'cleaning',
          note: 'Assigned to Olivia Brown · early-arrival turn',
          assignedTo: 'Olivia Brown',
        })
        upsertTask({
          id: 'hk-416',
          roomNumber: '416',
          title: 'Prepare room for early arrival',
          action: 'Complete a full clean and inspect so Room 416 can take Olivia Brown at 12:30.',
          dueTime: '12:05',
          status: 'due',
          why: 'Coordinator assigned Olivia Brown to 416. Finish this turn so inspection can start.',
          items: ['Standard double linen', 'Welcome kit', 'Early-arrival door card'],
          checklist: [
            { id: 'c1', label: 'Departure linen removed', complete: true },
            { id: 'c2', label: 'Bathroom and surfaces complete', complete: false },
            { id: 'c3', label: 'Ready for supervisor inspect', complete: false },
          ],
          source: 'coordinator',
        })
        toast('Room 416 assigned. Housekeeping trace and Rooms inventory are updated.')
      },
      startTask: (id) => {
        dispatch({ type: 'patch-task', id, patch: { status: 'in-progress' } })
        toast('Task started.')
      },
      completeTask: (id) => {
        if (id === 'hk-cot') {
          api.completeMayaCot()
          return
        }
        const task = state.hkTasks.find((t) => t.id === id)
        dispatch({
          type: 'patch-task',
          id,
          patch: { status: 'complete', checklist: task?.checklist.map((c) => ({ ...c, complete: true })) },
        })
        if (task) {
          patchRoom(task.roomNumber, { status: 'inspection', note: `Housekeeping complete · awaiting inspection` })
          const linked = state.cases.find((c) => c.roomNumber === task.roomNumber)
          if (linked) {
            patch(linked.id, (c) =>
              addAudit(
                {
                  ...c,
                  traces: c.traces.map((t) =>
                    t.department === 'Housekeeping' && t.roomNumber === task.roomNumber && t.status !== 'cancelled'
                      ? { ...t, status: 'complete', evidence: 'Housekeeping marked complete' }
                      : t,
                  ),
                  checks: c.checks.map((k) =>
                    k.label.toLowerCase().includes('clean') ? { ...k, complete: true } : k,
                  ),
                  tasksComplete: Math.min(c.tasksTotal, c.tasksComplete + 1),
                  nextAction: 'Await inspection, then Coordinator verifies ready',
                },
                'Housekeeping trace complete',
                `Room ${task.roomNumber} marked complete on the housekeeping list`,
                'Anna K.',
              ),
            )
          }
        }
        toast('Task marked complete. The case and Rooms tab now show inspection pending.')
      },
      submitFlag: (reason) => {
        if (state.flagTaskId) {
          dispatch({ type: 'patch-task', id: state.flagTaskId, patch: { status: 'blocked' } })
        }
        dispatch({ type: 'flag-task', id: null })
        toast(`Coordinator notified — readiness plan will be re-evaluated (${reason}).`)
      },
      updateMessage: (id, msgPatch) => {
        patch(id, (c) => ({ ...c, message: { ...c.message, ...msgPatch } }))
      },
      sendDraft: (id) => {
        const c = state.cases.find((x) => x.id === id)
        if (!c) return
        const isReadyMsg = /room is ready/i.test(c.message.body)
        const verified = c.status === 'ready' && c.checks.every((k) => k.complete)
        if (isReadyMsg && !verified) {
          toast('Room-ready messages stay locked until every required check is complete.')
          return
        }
        if (verified) {
          patch(id, (cur) =>
            addAudit(
              {
                ...cur,
                nextAction: 'Guest notified',
                message: { ...cur.message, status: 'sent', safeToSend: true, approvalLabel: 'Safe to send: readiness verified' },
              },
              'Sent room-ready message',
              'All required room-readiness checks complete',
            ),
          )
          toast('Room-ready message sent.')
          return
        }
        patch(id, (cur) =>
          addAudit(
            { ...cur, message: { ...cur.message, status: 'sent' } },
            'Sent holding message',
            'Brand-safe delay template — does not claim the room is ready',
          ),
        )
        toast('Holding message sent. Room-ready copy remains locked.')
      },
      resolveDecision: (id, actionId) => {
        if (id === 'd-maya') {
          if (actionId === 'approve') api.approveMaya()
          else if (actionId === 'keep') api.keepMaya()
          else {
            api.keepMaya()
            closeDecision('d-maya', 'escalated', 'Room-change decision escalated to duty manager.')
            toast('Kiara Garcia’s room change escalated. 412 and 418 are unchanged.')
          }
          return
        }
        if (id === 'd-daniel') {
          if (actionId === 'approve') api.approveDaniel()
          else if (actionId === 'keep') api.keepDaniel()
          else if (actionId === 'escalate') {
            api.keepDaniel()
            closeDecision('d-daniel', 'escalated', 'Maintenance escalated to duty manager.')
            toast('Daniel Kim’s maintenance issue escalated.')
          } else {
            api.contactDaniel()
            closeDecision('d-daniel', 'approved', 'Opened guest contact with holding copy. Allocation still requires a separate approval.')
          }
          return
        }
        if (id === 'd-olivia') {
          if (actionId === 'approve') api.oliviaPromiseAction('expect')
          else if (actionId === 'wait') api.oliviaPromiseAction('wait')
          else api.oliviaPromiseAction('escalate')
          return
        }
        if (id === 'd-samira') {
          if (actionId === 'approve') api.approveSamira()
          else if (actionId === 'review') {
            dispatch({ type: 'select', id: 'samira' })
            toast('Opened Samira Khan’s case to review accessible alternatives.')
          } else {
            patch('samira', (c) =>
              addAudit({ ...c, nextAction: 'Duty manager owns accessible recovery' }, 'Escalated accessibility move', 'Automatic move forbidden'),
            )
            closeDecision('d-samira', 'escalated', 'Duty manager owns the accessible-room recovery.')
            toast('Samira Khan escalated. No room was moved.')
          }
          return
        }
        if (id === 'd-sofia') {
          if (actionId === 'approve') api.approveSofia()
          else api.escalateSofia()
        }
      },
      oliviaPromiseAction: (kind) => {
        if (kind !== 'wait' && !guardWrite()) return
        if (kind === 'expect') {
          patch('olivia', (c) =>
            addAudit(
              {
                ...c,
                promise: {
                  ...c.promise,
                  phase: 'forecast',
                  currentPromise: 'Expectation set — early arrival acknowledged, readiness not confirmed',
                },
                message: {
                  ...c.message,
                  status: 'sent',
                  safeToSend: false,
                  approvalLabel: 'Expectation-setting only — not a ready promise',
                  body: 'Hi Olivia, we have received your 12:30 arrival request. We will confirm as soon as a matching room has passed inspection. We cannot promise the room is ready yet.',
                },
              },
              'Sent expectation-setting message',
              'Early-arrival confirmations require verified readiness',
            ),
          )
          closeDecision('d-olivia', 'approved', 'Expectation-setting message sent. Ready promise still locked.')
          toast('Expectation-setting message sent. Ready promise remains locked.')
          return
        }
        if (kind === 'conditional') {
          patch('olivia', (c) =>
            addAudit(
              {
                ...c,
                promise: {
                  ...c.promise,
                  phase: 'forecast',
                  currentPromise: 'Conditional: confirm by 12:20 if Room 416 inspection passes',
                },
              },
              'Set conditional early-arrival promise',
              'Confirmation still requires inspection evidence',
            ),
          )
          toast('Conditional promise logged. Guest will only be confirmed after inspection.')
          return
        }
        if (kind === 'wait') {
          closeDecision('d-olivia', 'rejected', 'Wait for operational confirmation.')
          toast('No guest message sent. Waiting for Room 416 verification.')
          return
        }
        patch('olivia', (c) =>
          addAudit({ ...c, nextAction: 'Duty manager owns early-arrival promise' }, 'Escalated early-arrival promise', 'Inspection still pending'),
        )
        closeDecision('d-olivia', 'escalated', 'Early-arrival promise escalated to duty manager.')
        toast('Early-arrival promise escalated.')
      },
      verifyOliviaReady: () => {
        patch('olivia', (c) =>
          addAudit(
            {
              ...c,
              status: 'ready',
              statusDetail: 'Verified ready at 12:12',
              verifiedAt: '12:12',
              riskReason: 'Inspection passed',
              tasksComplete: 4,
              nextAction: 'Send room ready message',
              checks: c.checks.map((k) => ({ ...k, complete: true })),
              traces: c.traces.map((t) => ({ ...t, status: 'complete', evidence: 'Inspection passed' })),
              promise: {
                phase: 'verified',
                predictedReady: '12:15',
                predictedConfidence: 78,
                currentPromise: 'Verified ready at 12:12',
                verifiedReadyAt: '12:12',
                standardCheckIn: '15:00',
                requestedArrival: '12:30',
              },
              message: {
                ...c.message,
                status: 'draft',
                safeToSend: true,
                approvalLabel: 'Safe to send: readiness verified',
                body: 'Hi Olivia, your room is ready. You can complete check-in now and collect your key from reception.',
              },
            },
            'Verified Room 416 ready',
            'All required room-readiness checks complete',
            'Priya S.',
          ),
        )
        patchRoom('416', { status: 'ready', note: 'Verified ready for Olivia Brown', assignedTo: 'Olivia Brown' })
        toast('Verified ready at 12:12. Room-ready message is now unlocked.')
      },
      approveSamira: () => {
        if (!guardWrite()) return
        patch('samira', (c) =>
          addAudit(
            {
              ...c,
              roomNumber: '214',
              floor: 2,
              status: 'in-preparation',
              statusDetail: 'Accessible move 112 → 214 approved',
              riskReason: 'Handover inspection on 214',
              nextAction: 'Verify Room 214 before guest message',
              whyThisRoom: 'Room 214 is an inspected accessible king. Duty manager approved the move after 112 was blocked.',
              traces: [
                { ...c.traces[0], status: 'cancelled' as const, evidence: 'Closed — room no longer assigned', roomNumber: '112' },
                {
                  id: 'tr-214',
                  caseId: 'samira',
                  name: 'Accessible handover inspection',
                  department: 'Supervisor',
                  owner: 'Priya S.',
                  status: 'in-progress' as const,
                  dueTime: '16:10',
                  evidence: 'Policy-approved accessible substitute',
                  roomNumber: '214',
                },
              ],
              recommendation: c.recommendation ? { ...c.recommendation, approved: true } : undefined,
              message: {
                ...c.message,
                status: 'draft',
                body: 'Hi Samira, we are preparing an accessible room for your arrival and will confirm as soon as it is verified ready.',
              },
            },
            'Approved accessible move 112 → 214',
            'Accessibility bookings must never be moved automatically',
          ),
        )
        patchRoom('112', { note: 'Released from Samira Khan · still blocked', assignedTo: undefined })
        patchRoom('214', { status: 'inspection', note: 'Assigned to Samira Khan · accessible handover', assignedTo: 'Samira Khan' })
        upsertTask({
          id: 'hk-214',
          roomNumber: '214',
          title: 'Accessible handover inspection',
          action: 'Confirm accessibility hardware and leave Room 214 inspection-ready for Samira Khan.',
          dueTime: '16:10',
          status: 'due',
          why: 'Duty manager approved an accessible-room move after 112 was blocked. This cannot be automatic.',
          items: ['Accessibility hardware check', 'Inspection card'],
          checklist: [
            { id: 'c1', label: 'Hardware verified', complete: false },
            { id: 'c2', label: 'Ready for supervisor', complete: false },
          ],
          source: 'coordinator',
        })
        closeDecision('d-samira', 'approved', 'Moved Samira Khan to accessible Room 214. Ready message still locked.')
        toast('Samira Khan moved to Room 214. Housekeeping and Rooms are updated.')
      },
      ackHandover: (id) => dispatch({ type: 'patch-ack', id }),
      ackAllHandover: () => {
        dispatch({ type: 'patch-ack', id: 'all' })
        toast('Evening handover acknowledged by Priya Shah.')
      },
      setAutonomyMode: (mode) => {
        dispatch({ type: 'autonomy', mode })
        if (mode === 'bounded') {
          toast('Bounded auto-execution on. Eligible SOP actions will run; policy exceptions stay in the inbox.')
        } else if (mode === 'approve') {
          toast('Approve-to-execute. Agents recommend; staff click to write.')
        } else if (mode === 'recommend') {
          toast('Recommend only. No writes to Mews from this prototype.')
        } else {
          toast('Automation paused. Kill switch is on.')
        }
      },
      runBoundedAutomation: () => {
        if (state.autonomyMode !== 'bounded') {
          toast('Turn on Bounded auto-execution in Policies first.')
          return
        }
        bypassGuard = true
        const olivia = state.cases.find((c) => c.id === 'olivia')
        const sofia = state.cases.find((c) => c.id === 'sofia')
        const ran: string[] = []
        if (olivia && !olivia.roomNumber) {
          api.assignOlivia()
          closeDecision('d-olivia', 'approved', 'Bounded auto: assigned 416 and sent expectation-setting message.')
          ran.push('assigned Olivia to 416 and sent an expectation-setting message')
        } else if (state.decisions.find((d) => d.id === 'd-olivia')?.status === 'open') {
          api.oliviaPromiseAction('expect')
          ran.push('sent Olivia an expectation-setting message')
        }
        if (sofia && sofia.status === 'at-risk' && !sofia.recommendation?.approved) {
          api.approveSofia()
          ran.push('reassigned Sofia’s inspection')
        }
        bypassGuard = false
        if (ran.length === 0) {
          toast('No eligible auto actions left. Suite and accessibility decisions remain human-owned.')
          return
        }
        toast(`Auto-ran: ${ran.join('; ')}. Kiara (room change), Daniel (suite) and Samira (accessibility) stayed in the inbox.`)
      },
    }
    return api
  }, [state, selected])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('Store missing')
  return ctx
}
