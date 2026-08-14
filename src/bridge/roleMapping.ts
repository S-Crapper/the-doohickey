import type { Store } from "../db/store.ts";
import type { StoatClient } from "../stoat/client.ts";

/**
 * Replace Discord role mentions (<@&123>) with Stoat role mentions (<@ULID>)
 * using the role links in the store. Falls back to plain text when no mapping.
 */
export function mapDiscordRoleMentionsToStoat(
  content: string,
  store: Store,
  discordGuildId?: string
): string {
  if (!content) return content;
  return content.replace(/<@&(\d+)>/g, (_m, discordRoleId: string) => {
    const mapped = store.getRoleByDiscordId(discordRoleId);
    if (mapped && (!discordGuildId || mapped.server_link_guild_id === discordGuildId)) {
      // Stoat/Revolt role mentions use the ampersand marker like Discord: <@&ULID>
      return `<@&${mapped.stoat_role_id}>`;
    }
    return "@discord-role";
  });
}

/**
 * Replace Stoat role mentions (<@ULID>) with Discord role mentions (<@&id>)
 * by resolving the Discord guild for the linked channel and looking up role links.
 */
export async function mapStoatRoleMentionsToDiscord(
  content: string,
  store: Store,
  discordClient: import("discord.js").Client | undefined,
  discordChannelId: string,
  stoatClient?: StoatClient
): Promise<string> {
  if (!content) return content;
  // Need a guild ID to look up per-guild role links
  if (!discordClient) return content.replace(/<@([A-Z0-9]{26})>/g, "@stoat-role");

  try {
    const ch = await discordClient.channels.fetch(discordChannelId);
    // If channel isn't in a guild, bail
    // @ts-ignore - some channel types don't have guildId
    const guildId = (ch as any)?.guildId;
    if (!guildId) return content.replace(/<@([A-Z0-9]{26})>/g, "@stoat-role");

    const links = store.getRolesForGuild(guildId);
    if (!links || links.length === 0) return content.replace(/<@&([A-Z0-9]{26})>/g, "@stoat-role");

    const map: Record<string, string> = {};
    for (const l of links) map[l.stoat_role_id] = l.discord_role_id;

    return content.replace(/<@&([A-Z0-9]{26})>/g, (m, stoatRoleId: string) => {
      const discordRole = map[stoatRoleId];
      if (discordRole) return `<@&${discordRole}>`;
      return "@stoat-role";
    });
  } catch (err) {
    return content.replace(/<@([A-Z0-9]{26})>/g, "@stoat-role");
  }
}

export default null as unknown as void;
