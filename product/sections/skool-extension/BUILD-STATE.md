# Skool Chrome Extension - Build State

> **Purpose:** Chrome extension that handles ALL Skool communication (DOM scraping, WebSocket interception, message sending) and pushes data to 0ne-app for database storage and GHL sync.
> **Status:** Phase 1 - Foundation

---

## Quick Resume

**Last Updated:** 2026-02-14
**Current Phase:** Phase 1 Complete - Ready for Phase 2
**Blocker:** None

---

## ⚠️ CRITICAL: Multi-Agent Build Protocol

**This project MUST use the multi-agent workflow.**

### The Rule: Each Phase = 1 Agent

```
DO NOT build multiple phases in a single session.
DO NOT skip the agent workflow for "simple" phases.
ALWAYS spawn a Task agent for each phase.
```

### How to Deploy a Phase

1. Main session reads BUILD-STATE
2. Main session spawns a Task agent with phase details
3. Agent completes phase → commits → returns
4. Main session updates BUILD-STATE checkboxes
5. Repeat for next phase

---

## Why We Need This

### Current Limitations (discovered 2026-02-14)

| Problem | Impact | Extension Solution |
|---------|--------|-------------------|
| **Skool API returns ~1 message per conversation** | Cannot backfill full DM history | DOM scraping captures complete conversations |
| **Cookies expire frequently** | Server-side sync breaks silently | Extension uses active browser session |
| **No real-time sync** | Polling-based, delayed updates | WebSocket interception for instant capture |

### Multi-Staff Requirement

Jimmy + Juan (and potentially more) need to:
- Each use their own Skool account
- See all conversations in one GHL inbox
- Know WHO received/sent each message
- Reply from GHL and route to correct Skool account

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CHROME EXTENSIONS                                │
│                                                                          │
│    ┌────────────────────┐        ┌────────────────────┐                 │
│    │  Jimmy's Browser   │        │   Juan's Browser   │                 │
│    │  (Extension)       │        │   (Extension)      │                 │
│    │                    │        │                    │                 │
│    │  • DOM scraping    │        │  • DOM scraping    │                 │
│    │  • WebSocket tap   │        │  • WebSocket tap   │                 │
│    │  • Send messages   │        │  • Send messages   │                 │
│    │  • Cookie extract  │        │  • Cookie extract  │                 │
│    └─────────┬──────────┘        └─────────┬──────────┘                 │
│              │                             │                             │
│              └──────────────┬──────────────┘                            │
│                             │                                            │
│                    HTTPS Push to 0ne-app                                │
└─────────────────────────────┼────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                           0NE-APP (Vercel)                               │
│                                                                          │
│    ┌────────────────────────────────────────────────────────────┐       │
│    │  API Routes                                                 │       │
│    │                                                             │       │
│    │  /api/extension/push-messages    ← Inbound from extension  │       │
│    │  /api/extension/get-pending      → Outbound queue          │       │
│    │  /api/extension/confirm-sent     ← Delivery confirmation   │       │
│    │  /api/extension/push-cookies     ← Cookie refresh          │       │
│    └──────────────────────┬─────────────────────────────────────┘       │
│                           │                                              │
│              ┌────────────┴────────────┐                                │
│              ↓                         ↓                                │
│    ┌─────────────────┐       ┌─────────────────┐                        │
│    │    Supabase     │       │       GHL       │                        │
│    │   (Database)    │       │  (Conversation  │                        │
│    │                 │       │    Provider)    │                        │
│    │  • dm_messages  │       │                 │                        │
│    │  • staff_users  │       │  • Push inbound │                        │
│    │  • sync_queue   │       │  • Get outbound │                        │
│    └─────────────────┘       └─────────────────┘                        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Multi-Staff Message Attribution

### Prefix System

**Inbound messages (Member → Staff) - LEFT side in GHL:**
```
John to Jimmy (via Skool): Hey, question about the course
John to Juan (via Skool): Can you help with my application?
```

**Outbound messages (Staff → Member) - RIGHT side in GHL:**
```
Jimmy (via Skool): Sure, here's what you need to do...
Juan (via Skool): I'll take a look at your file.
```

### Outbound Routing Priority

| Priority | Method | Example |
|----------|--------|---------|
| 1️⃣ **Override prefix** | User types `@juan ` at start of message | `@juan Hey...` → routes to Juan's Skool |
| 2️⃣ **GHL user mapping** | Look up GHL user → default Skool user | Jimmy's GHL → Jimmy's Skool |
| 3️⃣ **Last conversation** | Who last talked to this contact on Skool? | If Juan was last, route to Juan |
| 4️⃣ **Fallback** | Default staff (Jimmy) | If no other match, use primary account |

---

## Build Phases

### Phase 1: Extension Foundation ✅ COMPLETE
**Goal:** Basic extension shell that can read Skool DMs and push to 0ne-app

| Task | Status | Description |
|------|--------|-------------|
| 1.1 | ✅ | Create extension project (Manifest V3, TypeScript, esbuild) |
| 1.2 | ✅ | Implement Skool user detection (JWT parsing from auth_token cookie) |
| 1.3 | ✅ | Content script: Monitor DM inbox DOM changes |
| 1.4 | ✅ | Extract message data from DOM (sender, content, timestamp) |
| 1.5 | ✅ | Service worker: Relay messages to 0ne-app API |
| 1.6 | ✅ | Create `/api/extension/push-messages` endpoint |
| 1.7 | ✅ | Basic popup UI: Connection status, sync stats |

### Phase 2: Full DM History Scraping ⬅️ NEXT
**Goal:** Scrape complete conversation history (solving the API limitation)

| Task | Status | Description |
|------|--------|-------------|
| 2.1 | ⬅️ NEXT | Content script: Trigger scroll-to-top in conversation view |
| 2.2 | ⬜ | Observe DOM mutations during scroll (capture all messages) |
| 2.3 | ⬜ | Deduplication: Track message IDs to avoid re-pushing |
| 2.4 | ⬜ | Rate limiting: Throttle scroll actions to appear human |
| 2.5 | ⬜ | Batch push: Send messages in batches to reduce API calls |

### Phase 3: WebSocket Interception
**Goal:** Real-time message capture without polling

| Task | Status | Description |
|------|--------|-------------|
| 3.1 | ⬜ | Inject script to intercept `WebSocket.prototype.send` |
| 3.2 | ⬜ | Parse Skool WebSocket message format |
| 3.3 | ⬜ | Filter for DM events (new message, typing, read receipt) |
| 3.4 | ⬜ | Immediately push new messages to 0ne-app |
| 3.5 | ⬜ | Fall back to DOM polling if WebSocket unavailable |

### Phase 4: Outbound Message Sending
**Goal:** Send DMs from GHL through the extension

| Task | Status | Description |
|------|--------|-------------|
| 4.1 | ⬜ | Create `/api/extension/get-pending` endpoint (poll for outbound queue) |
| 4.2 | ⬜ | Service worker: Poll endpoint at 30-second intervals |
| 4.3 | ⬜ | Content script: Navigate to target DM conversation |
| 4.4 | ⬜ | DOM automation: Inject message into compose box, trigger send |
| 4.5 | ⬜ | Create `/api/extension/confirm-sent` endpoint |
| 4.6 | ⬜ | Update GHL message status on confirmation |

### Phase 5: Multi-Staff Support
**Goal:** Support multiple team members with their own Skool accounts

| Task | Status | Description |
|------|--------|-------------|
| 5.1 | ⬜ | Create `staff_users` table with Skool ID → display name + GHL user ID |
| 5.2 | ⬜ | Modify push-messages to include staff_skool_id |
| 5.3 | ⬜ | Implement inbound prefix: `{Contact} to {Staff} (via Skool): message` |
| 5.4 | ⬜ | Implement outbound prefix (extend existing for multi-staff) |
| 5.5 | ⬜ | Implement outbound routing: GHL user → Skool user mapping |
| 5.6 | ⬜ | Implement `@staffname` override prefix parsing |
| 5.7 | ⬜ | Modify get-pending to filter by staff's Skool ID |
| 5.8 | ⬜ | Admin UI: Manage staff users in 0ne-app |

### Phase 6: Cookie Management
**Goal:** Auto-sync cookies to server for backup/KPI sync

| Task | Status | Description |
|------|--------|-------------|
| 6.1 | ⬜ | Content script: Extract all Skool cookies (auth_token, session) |
| 6.2 | ⬜ | Create `/api/extension/push-cookies` endpoint |
| 6.3 | ⬜ | Store encrypted in Supabase (per staff) |
| 6.4 | ⬜ | Update SKOOL_COOKIES env var or use per-staff cookies |
| 6.5 | ⬜ | Alert mechanism when cookies approach expiry |

### Phase 7: Clerk Auth Integration (Future)
**Goal:** Replace manual API key with seamless Clerk authentication

| Task | Status | Description |
|------|--------|-------------|
| 7.1 | ⬜ | Extension checks if user is logged into app.project0ne.ai |
| 7.2 | ⬜ | Use Clerk session token for API authentication |
| 7.3 | ⬜ | Remove manual API key requirement from popup |
| 7.4 | ⬜ | Auto-link Skool user to Clerk user in database |
| 7.5 | ⬜ | Show "Login to 0ne" button if not authenticated |

---

## Critical File Paths

### Extension (to be created)
```
03 - BUILD/03-1 - Apps/Skool-Extension/
├── manifest.json
├── package.json
├── tsconfig.json
├── esbuild.config.mjs
├── src/
│   ├── background/
│   │   └── service-worker.ts       # Message relay, polling
│   ├── content/
│   │   ├── dm-monitor.ts           # DOM observation
│   │   ├── dm-sender.ts            # Outbound DOM automation
│   │   ├── websocket-tap.ts        # WebSocket interception
│   │   └── cookie-extractor.ts     # Cookie management
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.tsx               # Status UI
│   │   └── popup.css
│   ├── lib/
│   │   ├── api-client.ts           # 0ne-app API client
│   │   ├── skool-parser.ts         # DOM parsing utilities
│   │   └── storage.ts              # Chrome storage wrapper
│   └── types/
│       └── index.ts
└── dist/                           # Built extension (gitignored)
```

### 0ne-app API Routes (to be created)
```
apps/web/src/app/api/extension/
├── push-messages/route.ts          # Inbound from extension
├── get-pending/route.ts            # Outbound queue
├── confirm-sent/route.ts           # Delivery confirmation
└── push-cookies/route.ts           # Cookie sync
```

### Database Changes (to be created)
```sql
-- staff_users table
CREATE TABLE staff_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  skool_user_id TEXT UNIQUE NOT NULL,
  skool_username TEXT,
  display_name TEXT,
  ghl_user_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modify dm_messages
ALTER TABLE dm_messages ADD COLUMN staff_skool_id TEXT;
ALTER TABLE dm_messages ADD COLUMN staff_display_name TEXT;

-- extension_cookies table
CREATE TABLE extension_cookies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_skool_id TEXT NOT NULL REFERENCES staff_users(skool_user_id),
  cookies_encrypted TEXT NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Extension Framework | Manifest V3 (vanilla, no Plasmo) |
| Language | TypeScript |
| Build Tool | Bun + esbuild |
| Popup UI | React (minimal) |
| API Client | fetch (native) |
| Storage | chrome.storage.local |
| Auth | Skool JWT parsing (no separate auth needed) |

---

## Security Considerations

1. **Extension-to-Server Auth:**
   - Generate unique API key per staff in 0ne-app
   - Store in extension's chrome.storage.local
   - Send in `Authorization` header

2. **Cookie Encryption:**
   - Encrypt cookies before storing in Supabase
   - Use environment-based encryption key

3. **No Public Distribution:**
   - Developer mode only (no Chrome Web Store)
   - Manual installation per team member

---

## Verification Checklists

### Phase 1 Verification
- [ ] Extension loads in Chrome developer mode
- [ ] Shows popup with "Skool Extension" text
- [ ] Console shows "Service worker registered"
- [ ] Content script detects Skool DM pages
- [ ] Messages extracted from DOM match actual content
- [ ] Push to 0ne-app API succeeds

### Phase 4 Verification
- [ ] GHL outbound message appears in pending queue
- [ ] Extension receives and processes pending message
- [ ] DOM automation sends message successfully
- [ ] Confirmation sent back to 0ne-app
- [ ] GHL shows message as delivered

### Phase 5 Verification
- [ ] Extension on Jimmy's browser pushes with Jimmy's staff ID
- [ ] Extension on Juan's browser pushes with Juan's staff ID
- [ ] GHL shows prefixed messages from both staff
- [ ] Reply from GHL routes to correct staff's Skool

---

## Agent Prompt Template

```
Deploy Phase {X.Y} of the Skool Chrome Extension.

CONTEXT:
- Read BUILD-STATE: 03 - BUILD/03-1 - Apps/0ne-app/product/sections/skool-extension/BUILD-STATE.md
- Extension location: 03 - BUILD/03-1 - Apps/Skool-Extension/
- 0ne-app location: 03 - BUILD/03-1 - Apps/0ne-app/

TASK:
{Task description from BUILD-STATE}

SUCCESS CRITERIA:
{Specific verification steps}

COMMIT: "Phase {X.Y}: {Description}"
```

---

## Next Step

**Deploy Phase 1.1:** Create extension project structure
