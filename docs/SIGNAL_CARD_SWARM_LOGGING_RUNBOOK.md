# Signal Card Swarm Logging Runbook

Date: 2026-04-30
Linear: `THI-54`

## Purpose

Signal Card conversations must be visible to the operator in the Third Signal #admin Swarm Coordination Inbox.

## Logging Paths

Explicit handoffs:

- Signal Card live tools call `live.operatorAction`.
- The server writes `/api/coordination/report` to the Swarm backend.
- These reports should appear in #admin immediately.

Automatic archival:

- The live client archives ordinary conversations on session close/stop/unmount.
- It only archives when the session has at least one user turn.
- It skips auto-archive if an operator/contact report was already filed for that session.

## Production Endpoints

- Signal Card: `https://line.thirdsignal.ai`
- Swarm backend: `https://orbital-swarm-adk-oxiyp4dcpq-ew.a.run.app`
- #admin reader: Supabase Edge Function `swarm-coordination`

## Health Check

Write a synthetic report through the public Signal Card server path:

```bash
curl -sS 'https://line.thirdsignal.ai/api/trpc/live.report?batch=1' \
  -H 'content-type: application/json' \
  -d '{"0":{"json":{"visitorName":"Healthcheck","transcript":"Synthetic Signal Card logging healthcheck.","messageCount":2,"userTurns":1,"messages":[{"role":"user","text":"Please log this test."},{"role":"model","text":"Routing."}]}}}'
```

Then list recent Signal Card reports from Swarm using the operator key:

```bash
SWARM_KEY="$(gcloud secrets versions access latest --secret=swarm-operator-api-key --project=third-signal-v2)"
curl -sS 'https://orbital-swarm-adk-oxiyp4dcpq-ew.a.run.app/api/coordination/reports' \
  -H "x-swarm-operator-key: ${SWARM_KEY}" \
  -H 'content-type: application/json' \
  -d '{"source":"signal-card","limit":5,"include_transcript":false}'
```

## Operator Expectation

The #admin inbox is not a raw transcript database. It is an operator coordination lane. After this update, ordinary live conversations are archived as coordination reports at session end, while high-intent moments still file richer operator/contact reports immediately.
