import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react'
import { hkTasks as seedTasks, initialCases } from '../data/mock'
import type { HkTask, ReadinessCase, Role, Toast } from '../types'

interface State {
  cases: ReadinessCase[]
  hkTasks: HkTask[]
  toasts: Toast[]
  selectedCaseId: string | null
  search: string
  role: Role
  chooseRoomFor: string | null
  flagTaskId: string | null
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
  assignOlivia: () => void
  startTask: (id: string) => void
  completeTask: (id: string) => void
  submitFlag: (reason: string) => void
  updateMessage: (id: string, patch: Partial<ReadinessCase['message']>) => void
  sendDraft: (id: string) => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    cases: initialCases,
    hkTasks: seedTasks,
    toasts: [],
    selectedCaseId: null,
    search: '',
    role: 'manager' as Role,
    chooseRoomFor: null,
    flagTaskId: null,
  })

  const selected = state.cases.find((c) => c.id === state.selectedCaseId) ?? null

  const value = useMemo<StoreValue>(() => {
    const toast = (message: string) => dispatch({ type: 'toast', message })
    const patch = (id: string, next: (c: ReadinessCase) => ReadinessCase) => {
      const current = state.cases.find((c) => c.id === id)
      if (!current) return
      dispatch({ type: 'patch-case', id, patch: next(current) })
    }

    return {
      ...state,
      selected,
      select: (id) => dispatch({ type: 'select', id }),
      setSearch: (q) => dispatch({ type: 'search', q }),
      setRole: (role) => dispatch({ type: 'role', role }),
      toast,
      dismissToast: (id) => dispatch({ type: 'dismiss-toast', id }),
      approveSofia: () => {
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
        toast('Inspection reassigned to Priya S.')
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
        toast('Room 225 verified ready. Room-ready message is now unlocked.')
      },
      sendReadyMessage: (id) => {
        patch(id, (c) => {
          if (!c.checks.every((k) => k.complete) && c.status !== 'ready') return c
          return addAudit(
            {
              ...c,
              nextAction: 'Guest notified',
              message: { ...c.message, status: 'sent', safeToSend: true, approvalLabel: 'Safe to send: readiness verified' },
              timeline: c.timeline.some((t) => t.label.includes('Guest message'))
                ? c.timeline.map((t) => (t.label.includes('Guest message') ? { ...t, complete: true, time: now() } : t))
                : [...c.timeline, { id: 'msg', label: 'Guest message sent', time: now(), complete: true }],
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
            },
            'Chose alternative room',
            `Operator selected Room ${room} instead of reassigning inspection`,
          ),
        )
        dispatch({ type: 'choose-room', id: null })
        toast(`Sofia Garcia reallocated to Room ${room}. Verification still required.`)
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
      },
      approveDaniel: () => {
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
                  id: 'tr-510-inspect',
                  caseId: 'daniel',
                  name: 'Suite 510 handover check',
                  department: 'Supervisor',
                  owner: 'Priya S.',
                  status: 'in-progress',
                  dueTime: '14:20',
                  evidence: 'Inspected inventory · confirming setup',
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
        toast('Daniel Kim reallocated to Suite 510. Guest message remains a holding note until verification.')
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
      },
      contactDaniel: () => {
        dispatch({ type: 'select', id: 'daniel' })
        toast('Opened Daniel Kim’s case with the holding message draft.')
      },
      assignOlivia: () => {
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
              recommendation: c.recommendation ? { ...c.recommendation, approved: true } : undefined,
            },
            'Assigned Room 416',
            'Inspected Standard Double supporting 12:30 early arrival',
          ),
        )
        toast('Room 416 assigned to Olivia Brown.')
      },
      startTask: (id) => {
        dispatch({ type: 'patch-task', id, patch: { status: 'in-progress' } })
        toast('Task started.')
      },
      completeTask: (id) => {
        const task = state.hkTasks.find((t) => t.id === id)
        dispatch({
          type: 'patch-task',
          id,
          patch: { status: 'complete', checklist: task?.checklist.map((c) => ({ ...c, complete: true })) },
        })
        toast('Task marked complete. Coordinator will re-evaluate readiness.')
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
    }
  }, [state, selected])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('Store missing')
  return ctx
}
