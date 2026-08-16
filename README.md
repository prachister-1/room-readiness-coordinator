# Room Readiness Coordinator

Clickable prototype for a Mews-inspired hotel operations product. It coordinates arrivals, housekeeping, maintenance, and guest messaging so the right room is ready for the right guest — then sends a verified room-ready message.

**Not a PMS. Not a chatbot. Mock data only.**

## Live demo

https://prachister-1.github.io/room-readiness-coordinator/

## Demo for recruiters (use cases)

Open the live app, then:

1. **UC-001** Arrival Readiness board — four states, forecast, recommendations (not yet executed)
2. **UC-002** Maya Patel — already verified Ready; feather-free SOP; guest notified
3. **UC-003** Sofia Garcia — Approve inspection reassignment → Mark complete → room-ready message unlocks
4. **UC-004** Daniel Kim — Approve 507 → 510; holding message only
5. **UC-005** Olivia Brown — Assign Room 416 for early arrival
6. **UC-006** Housekeeping — Anna K. executes traces (no AI chat)
7. **UC-007** Guest Messages — ready send locked until checks pass
8. **UC-008** Kenji / Priya Nair — VIP and accessibility hard stops

Full specs: `.arness/use-cases/`

## Run locally

```bash
npm install
npm run dev
```

Opens at http://localhost:5173/
