# Room Readiness Coordinator

Clickable prototype for a Mews-inspired hotel operations product. It coordinates arrivals, housekeeping, maintenance, and guest messaging so the right room is ready for the right guest — then sends a verified room-ready message.

**Not a PMS. Not a chatbot. Mock data only.**

## Demo for recruiters

Open the live app, then:

1. **Arrival Readiness** — click **Maya Patel** (room already verified ready)
2. **Sofia Garcia** — Approve recommendation → Mark inspection complete → Send room-ready message
3. **Daniel Kim** — Approve reallocation to Suite 510 (holding message only; does not claim ready)
4. **Housekeeping** — Anna K., Floor 4: start / complete / flag a problem
5. **Guest Messages** — Maya’s verified sent note vs Sofia’s locked room-ready draft
6. **Analytics** — readiness performance and AI trust

## Run locally

```bash
npm install
npm run dev
```

Opens at http://localhost:5173/
