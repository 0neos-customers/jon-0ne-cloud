# Hand-Raiser Campaign Management UI

**Created:** 2026-02-13
**Status:** Ready for implementation

---

## Overview

Build a UI for managing Hand-Raiser campaigns - automated DMs to Skool post commenters.

**Current State:** Backend is fully implemented (database, types, cron, processing logic). NO UI exists.

**Goal:** Create `/skool-sync/hand-raisers` page to create, edit, delete, and monitor campaigns.

---

## Multi-Agent Deployment Strategy (CRITICAL)

**Pattern:** Each phase = 1 agent with fresh context

```
┌─────────────────────────────────────────────────┐
│           PARALLEL (no dependencies)            │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │ Phase 1 │  │ Phase 2 │  │ Phase 3 │         │
│  │   API   │  │  Hook   │  │ Dialog  │         │
│  └─────────┘  └─────────┘  └─────────┘         │
│         \          |          /                 │
│          \         |         /                  │
│           v        v        v                   │
│              ┌─────────┐                        │
│              │ Phase 4 │                        │
│              │  Page   │                        │
│              └─────────┘                        │
│                   │                             │
│                   v                             │
│              [Push + Test]                      │
└─────────────────────────────────────────────────┘
```

| Phase | Agent Task | Files | Commit Message |
|-------|------------|-------|----------------|
| 1 | API Routes | 1 new | `Phase 1: Add hand-raiser campaigns API` |
| 2 | Data Hook | 1 new + 1 mod | `Phase 2: Add useHandRaisers hook` |
| 3 | Dialog Component | 1 new | `Phase 3: Add HandRaiserDialog component` |
| 4 | Page + Navigation | 1 new + 1 mod | `Phase 4: Add hand-raiser campaigns page` |

**Execution:**
1. Spawn Phases 1, 2, 3 in parallel (single message, 3 Task tool calls)
2. Wait for all 3 to complete
3. Spawn Phase 4 (depends on phases 1-3)
4. Push all commits

**Why agents?**
- Fresh context window per phase
- Parallel execution for independent phases
- Atomic commits per phase
- Resumable if interrupted

---

## Phase 1: API Routes

- [ ] Create `/apps/web/src/app/api/dm-sync/hand-raisers/route.ts`

**Endpoints:**
```typescript
GET    - List campaigns with stats (sent count per campaign)
POST   - Create campaign
PUT    - Update campaign
DELETE - Delete campaign
```

**Database tables:**
- `dm_hand_raiser_campaigns` - Campaign config
- `dm_hand_raiser_sent` - Sent DM records (for stats)

**Pattern reference:** `/apps/web/src/app/api/skool/campaigns/route.ts`

---

## Phase 2: Data Hook

- [ ] Create `/apps/web/src/features/dm-sync/hooks/use-hand-raisers.ts`
- [ ] Update `/apps/web/src/features/dm-sync/index.ts` to export hook

**Interface:**
```typescript
export function useHandRaisers(): {
  campaigns: HandRaiserCampaignWithStats[]
  isLoading: boolean
  error: Error | null
  refresh: () => void
}

export async function createHandRaiser(input): Promise<Result>
export async function updateHandRaiser(id, updates): Promise<Result>
export async function deleteHandRaiser(id): Promise<Result>
```

**Pattern reference:** `/apps/web/src/features/skool/hooks/use-campaigns.ts`

---

## Phase 3: Dialog Component

- [ ] Create `/apps/web/src/features/dm-sync/components/HandRaiserDialog.tsx`

**Form fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| post_url | text input | Yes | Skool post URL to monitor |
| dm_template | textarea | Yes | Message template (supports {{name}}, {{username}}) |
| keyword_filter | text input | No | Comma-separated keywords |
| ghl_tag | text input | No | Tag to apply in GHL |
| is_active | switch | Yes | Enable/disable |

**Features:**
- Template preview with sample data
- URL validation feedback
- Edit mode vs Create mode

**Pattern reference:** `/apps/web/src/features/skool/components/CampaignDialog.tsx`

---

## Phase 4: Page + Navigation

- [ ] Create `/apps/web/src/app/skool-sync/hand-raisers/page.tsx`
- [ ] Update `/apps/web/src/components/shell/Sidebar.tsx`

**Page layout:**
```
┌─────────────────────────────────────────────────┐
│ Hand-Raiser Campaigns            [+ New Campaign]│
│ Automatically DM users who comment on posts     │
├─────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Campaign 1  │ │ Campaign 2  │ │ Campaign 3  │ │
│ │ Post: ...   │ │ Post: ...   │ │ Post: ...   │ │
│ │ Sent: 45    │ │ Sent: 12    │ │ Sent: 0     │ │
│ │ [Edit][Del] │ │ [Edit][Del] │ │ [Edit][Del] │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────┘
```

**Campaign card shows:**
- Post URL (truncated)
- Keywords (if set)
- Sent count (from stats)
- Last sent timestamp
- Active/inactive badge
- Edit + Delete buttons

**Empty state:** "No hand-raiser campaigns yet. Create one to automatically DM users who comment on your Skool posts."

**Sidebar update:**
- Update Skool Sync nav item to point to `/skool-sync/hand-raisers`

---

## Files Summary

### New Files (4)
```
apps/web/src/app/api/dm-sync/hand-raisers/route.ts
apps/web/src/features/dm-sync/hooks/use-hand-raisers.ts
apps/web/src/features/dm-sync/components/HandRaiserDialog.tsx
apps/web/src/app/skool-sync/hand-raisers/page.tsx
```

### Modified Files (2)
```
apps/web/src/features/dm-sync/index.ts          # Export new hook
apps/web/src/components/shell/Sidebar.tsx       # Update nav
```

---

## Verification

After deployment:

1. **Navigate:** Go to `/skool-sync/hand-raisers`
2. **Create:** Click "New Campaign", fill form, save
3. **Verify DB:** Check `dm_hand_raiser_campaigns` table in Supabase
4. **Edit:** Edit the campaign, change template, save
5. **Toggle:** Disable campaign, verify `is_active = false`
6. **Delete:** Delete campaign, confirm removal
7. **Cron test:** Manually trigger `/api/cron/hand-raiser-check`

---

## Commit Strategy

Each phase commits separately (agents handle this):
```
Phase 1: Add hand-raiser campaigns API
Phase 2: Add useHandRaisers hook
Phase 3: Add HandRaiserDialog component
Phase 4: Add hand-raiser campaigns page
```

All commits include: `Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>`

After all phases complete, push all commits together.
