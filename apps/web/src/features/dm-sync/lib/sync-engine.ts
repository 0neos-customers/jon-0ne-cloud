/**
 * DM Sync Engine
 *
 * Orchestrates bidirectional sync between Skool DMs and GHL conversations.
 * Handles deduplication, error recovery, and rate limiting.
 *
 * @module dm-sync/lib/sync-engine
 */

import type {
  DmSyncConfig,
  SyncResult,
  SyncError,
  SkoolConversation,
  SkoolMessage,
  DmMessage,
} from '../types'
import { SkoolDmClient } from './skool-dm-client'
import { ContactMapper } from './contact-mapper'
import { GhlConversationClient } from './ghl-conversation'

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Sync engine configuration
 */
export interface SyncEngineConfig {
  config: DmSyncConfig
  skoolCookies: string
  ghlApiKey: string
}

/**
 * Sync options
 */
export interface SyncOptions {
  /** Maximum conversations to sync per run */
  maxConversations?: number
  /** Maximum messages per conversation */
  maxMessagesPerConversation?: number
  /** Sync only conversations with new messages since this date */
  since?: Date
  /** Dry run - don't actually send/store anything */
  dryRun?: boolean
}

// =============================================================================
// SYNC ENGINE CLASS
// =============================================================================

/**
 * Engine for syncing Skool DMs to GHL conversations
 *
 * @example
 * ```ts
 * const engine = new DmSyncEngine({
 *   config: syncConfig,
 *   skoolCookies: process.env.SKOOL_COOKIES!,
 *   ghlApiKey: process.env.GHL_API_KEY!
 * })
 *
 * const result = await engine.syncInbound()
 * console.log(`Synced ${result.stats.synced} messages`)
 * ```
 */
export class DmSyncEngine {
  private config: DmSyncConfig
  private skoolClient: SkoolDmClient
  private ghlClient: GhlConversationClient
  private contactMapper: ContactMapper

  constructor(engineConfig: SyncEngineConfig) {
    this.config = engineConfig.config

    // Initialize clients
    this.skoolClient = new SkoolDmClient({
      cookies: engineConfig.skoolCookies,
      communitySlug: this.config.skoolCommunitySlug,
    })

    this.ghlClient = new GhlConversationClient({
      apiKey: engineConfig.ghlApiKey,
      locationId: this.config.ghlLocationId,
    })

    this.contactMapper = new ContactMapper({
      userId: this.config.userId,
      ghlLocationId: this.config.ghlLocationId,
      ghlApiKey: engineConfig.ghlApiKey,
    })
  }

  /**
   * Sync inbound messages from Skool to GHL
   */
  async syncInbound(_options?: SyncOptions): Promise<SyncResult> {
    // TODO: Implement inbound sync
    // 1. Fetch Skool conversations
    // 2. For each conversation, check for new messages
    // 3. Map Skool user to GHL contact
    // 4. Get/create GHL conversation
    // 5. Sync messages to GHL
    // 6. Mark as synced in dm_messages table
    throw new Error('Not implemented')
  }

  /**
   * Sync outbound messages from GHL to Skool
   * (for messages sent in GHL that need to be echoed to Skool)
   */
  async syncOutbound(_options?: SyncOptions): Promise<SyncResult> {
    // TODO: Implement outbound sync (optional for v1)
    throw new Error('Not implemented')
  }

  /**
   * Full bidirectional sync
   */
  async sync(options?: SyncOptions): Promise<SyncResult> {
    const startTime = Date.now()
    const errors: SyncError[] = []

    let totalSynced = 0
    let totalSkipped = 0
    let totalFailed = 0
    let totalMessages = 0

    try {
      // Sync inbound messages
      const inboundResult = await this.syncInbound(options)
      totalMessages += inboundResult.stats.total
      totalSynced += inboundResult.stats.synced
      totalSkipped += inboundResult.stats.skipped
      totalFailed += inboundResult.stats.failed
      errors.push(...inboundResult.errors)
    } catch (error) {
      errors.push({
        error: `Inbound sync failed: ${error instanceof Error ? error.message : String(error)}`,
      })
    }

    return {
      success: errors.length === 0,
      stats: {
        total: totalMessages,
        synced: totalSynced,
        skipped: totalSkipped,
        failed: totalFailed,
      },
      errors,
      duration: Date.now() - startTime,
    }
  }

  /**
   * Check if a message has already been synced
   */
  async isMessageSynced(skoolMessageId: string): Promise<boolean> {
    // TODO: Query dm_messages table
    void skoolMessageId
    throw new Error('Not implemented')
  }

  /**
   * Record a synced message
   */
  async recordSyncedMessage(
    _skoolMessage: SkoolMessage,
    _ghlMessageId: string
  ): Promise<DmMessage> {
    // TODO: Insert into dm_messages table
    throw new Error('Not implemented')
  }

  /**
   * Get sync stats for the configuration
   */
  async getStats(): Promise<{
    totalConversations: number
    totalMessages: number
    lastSyncAt: Date | null
    pendingMessages: number
    failedMessages: number
  }> {
    // TODO: Query dm_messages table for stats
    throw new Error('Not implemented')
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

/**
 * Create a sync engine from configuration
 */
export function createSyncEngine(config: SyncEngineConfig): DmSyncEngine {
  return new DmSyncEngine(config)
}

/**
 * Create a sync engine from environment and database config
 */
export async function createSyncEngineFromConfig(
  configId: string
): Promise<DmSyncEngine> {
  // TODO: Fetch config from database
  // TODO: Initialize engine with environment variables
  void configId
  throw new Error('Not implemented')
}

// =============================================================================
// SYNC UTILITIES
// =============================================================================

/**
 * Determine if conversation needs syncing
 */
export function needsSync(
  conversation: SkoolConversation,
  lastSyncAt: Date | null
): boolean {
  if (!lastSyncAt) return true
  if (!conversation.lastMessageAt) return false
  return conversation.lastMessageAt > lastSyncAt
}

/**
 * Calculate sync priority for a conversation
 */
export function calculateSyncPriority(
  conversation: SkoolConversation
): number {
  let priority = 0

  // Higher priority for unread messages
  if (conversation.unreadCount > 0) {
    priority += 100 + Math.min(conversation.unreadCount, 50)
  }

  // Higher priority for recent messages
  if (conversation.lastMessageAt) {
    const hoursSinceLastMessage =
      (Date.now() - conversation.lastMessageAt.getTime()) / (1000 * 60 * 60)
    if (hoursSinceLastMessage < 1) priority += 50
    else if (hoursSinceLastMessage < 24) priority += 25
    else if (hoursSinceLastMessage < 72) priority += 10
  }

  return priority
}

/**
 * Sort conversations by sync priority
 */
export function sortBySyncPriority(
  conversations: SkoolConversation[]
): SkoolConversation[] {
  return [...conversations].sort(
    (a, b) => calculateSyncPriority(b) - calculateSyncPriority(a)
  )
}
