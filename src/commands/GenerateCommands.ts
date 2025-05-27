import {
  ActionRowBuilder,
  CommandInteraction,
  GuildMember,
  MessageActionRowComponentBuilder,
  Role,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction
} from 'discord.js';
import { Discord, SelectMenuComponent, Slash } from 'discordx';
import { prisma } from '../utils/prisma';
import { client } from '../utils/discord';
import { getEnv } from '../utils/env';
import { getModPath } from '../utils/mods';
import { existsSync } from 'fs';
import { relative, resolve } from 'path';
import { dirroot } from '..';
import { randomUUID } from 'crypto';
import { copyFile, mkdir, rm } from 'fs/promises';
import { lockFile } from '../utils/lock';

@Discord()
export class GenerateCommands {
  private async getMods() {
    // Generate select menu for mod
    const mods = await prisma.mods.findMany();
    if (!mods || mods.length === 0) return [];
    return mods.map((mod) => ({ label: `${mod.name} - ${mod.version}`, value: mod.id.toFixed(0) }));
  }

  private async getGuildMember(id: string) {
    const guild = await client.guilds.fetch(getEnv('GUILD_ID'));
    return await guild.members.fetch(id);
  }

  private async getGuildRole(id: string) {
    const guild = await client.guilds.fetch(getEnv('GUILD_ID'));
    return await guild.roles.fetch(id);
  }

  private async isOwner(member: GuildMember) {
    const guild = await client.guilds.fetch(getEnv('GUILD_ID'));
    return guild.ownerId === member.id;
  }

  private async isAdmin(member: GuildMember) {
    const user = await prisma.user.findUnique({ where: { discord: member.id } });
    return user?.admin ?? false;
  }

  private async hasFullAccess(member: GuildMember) {
    const accessRole = await this.getGuildRole(getEnv('ACCESS_ROLE_ID'));
    if (!accessRole) return false;
    return member.roles.cache.some((role) => role.id === accessRole.id);
  }

  private async hasModAccess(member: GuildMember, modRole: Role | null) {
    // If no role is set, only full access members can generate mods
    if (!modRole) return false;
    return member.roles.cache.some((role) => role.id === modRole.id);
  }

  private async generateUniqueFolder(base: string) {
    let path = resolve(base, randomUUID());
    while (existsSync(path)) path = resolve(base, randomUUID());
    await mkdir(path, { recursive: true });
    return path;
  }

  @Slash({ description: 'Generate a mod', name: 'generate' })
  async generate(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const member = await prisma.user.findUnique({
      where: { discord: interaction.user.id }
    });

    if (!member) {
      interaction.editReply({ content: ":x: - Member wasn't found in the database" });
      return;
    }

    if (!member.guid) {
      interaction.editReply({ content: ':x: - You need to set your guid first' });
      return;
    }

    // Generate select menu for mod
    const mods = await this.getMods();

    if (mods.length === 0) {
      interaction.editReply({ content: ':x: - There is currently no mod available' });
      return;
    }

    // Creating menu for selecting mod and version
    const menu = new StringSelectMenuBuilder().addOptions(mods).setCustomId('mod-selection');
    const buttonRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(menu);

    interaction.editReply({
      components: [buttonRow],
      content: 'Select the requested mod'
    });
  }

  @SelectMenuComponent({ id: 'mod-selection' })
  async selection(interaction: StringSelectMenuInteraction) {
    await interaction.deferReply({ ephemeral: true });

    interaction.editReply({ content: 'Generating: 0%' });

    // Get selected mod
    const modId = interaction.values?.[0];
    if (!modId) {
      // Generate select menu for mod
      const mods = await this.getMods();

      if (mods.length === 0) {
        interaction.followUp({
          content: ':x: - There is currently no mod available',
          ephemeral: true
        });
        return;
      }

      // Creating menu for selecting mod and version
      const menu = new StringSelectMenuBuilder().addOptions(mods).setCustomId('mod-selection');
      const buttonRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        menu
      );

      interaction.editReply({
        components: [buttonRow],
        content: ':x: - Mod not found, select again'
      });

      return;
    }

    const mod = await prisma.mods.findUnique({
      where: { id: parseInt(modId) }
    });

    if (!mod) {
      interaction.editReply({ content: ':x: - Mod not found' });
      return;
    }

    const modRole = mod.role ? await this.getGuildRole(mod.role) : null;

    // Check if the mod role exists
    if (!modRole && mod.role !== null) {
      interaction.editReply({ content: ':x: - Mod role not found' });
      return;
    }

    interaction.editReply({ content: 'Generating: 10%' });

    // Check member
    const member = await prisma.user.findUnique({
      where: { discord: interaction.user.id }
    });

    if (!member) {
      interaction.editReply({ content: ":x: - Member wasn't found in the database" });
      return;
    }

    if (!member.guid) {
      interaction.editReply({ content: ':x: - You need to set your guid first' });
      return;
    }

    interaction.editReply({ content: 'Generating: 15%' });

    // Check if the user has access to the mod
    const guildMember = await this.getGuildMember(interaction.user.id);
    const modAccess = await this.hasModAccess(guildMember, modRole);
    const fullAccess = await this.hasFullAccess(guildMember);
    const isAdmin = await this.isAdmin(guildMember);
    const isOwner = await this.isOwner(guildMember);
    if (!modAccess && !fullAccess && !isAdmin && !isOwner) {
      interaction.editReply({ content: ":x: - You don't have access to this mod" });
      return;
    }

    interaction.editReply({ content: 'Generating: 25%' });

    // Get the mod file
    const filepath = getModPath(mod.filename);
    if (!existsSync(filepath)) {
      interaction.editReply({ content: ':x: - Mod file not found' });
      return;
    }

    interaction.editReply({ content: 'Generating: 30%' });

    // Create tmp folder
    const tmpRoot = resolve(dirroot, 'tmp');
    const tmpPath = await this.generateUniqueFolder(tmpRoot);
    const tmpFile = resolve(tmpPath, mod.filename);
    const tmpRelPath = relative(dirroot, tmpFile);
    const deleteFile = async () => await rm(tmpPath, { recursive: true });
    interaction.editReply({ content: 'Generating: 40%' });

    try {
      // Copy the mod file to the tmp folder
      await copyFile(filepath, tmpFile);
      interaction.editReply({ content: 'Generating: 50%' });

      // Lock the file
      await lockFile(member.guid, tmpRelPath);
      interaction.editReply({ content: 'Generating: 75%' });

      // Copy the locked file to public folder and delete the tmp folder
      const publicRoot = resolve(dirroot, 'public');
      const publicPath = await this.generateUniqueFolder(publicRoot);
      const publicFile = resolve(publicPath, mod.filename);
      await copyFile(tmpFile, publicFile);
      interaction.editReply({ content: 'Generating: 99%' });

      // Get public url
      const serverUrl = getEnv('SERVER_URL');
      const url = new URL(relative(publicRoot, publicFile).replaceAll('\\', '/'), serverUrl);

      interaction.editReply({
        content: `:white_check_mark: - Mod generated successfully!\n\n**Mod Name:** ${mod.name}\n**Version:** ${mod.version}\n**Download URL:** [Click here](${url})\n\n**Warning:** This link will expire soon (When not downloading).`,
        components: []
      });
    } catch (e) {
      console.error(e);
      interaction.editReply({ content: ':x: - Error while generating mod' });
    }

    setTimeout(async () => await deleteFile().catch(console.error), 1000 * 30); // Delete the tmp folder after 30 seconds
  }
}
