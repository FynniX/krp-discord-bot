import { ApplicationCommandOptionType, CommandInteraction, GuildMember, Role } from 'discord.js';
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx';
import { prisma } from '../utils/prisma';
import { client } from '../utils/discord';
import { getEnv } from '../utils/env';

@Discord()
@SlashGroup({ name: 'mods', description: 'Manage your mods' })
export class ProfileCommands {
  private async isOwner(member: GuildMember) {
    const guild = await client.guilds.fetch(getEnv('GUILD_ID'));
    return guild.ownerId === member.id;
  }

  private async isAdmin(member: GuildMember) {
    const user = await prisma.user.findUnique({ where: { discord: member.id } });
    return user?.admin ?? false;
  }

  @SlashGroup('mods')
  @Slash({ description: 'Create a mod that can be encrypted later on', name: 'create' })
  async create(
    @SlashOption({
      description: 'Name of the mod',
      name: 'name',
      required: true,
      type: ApplicationCommandOptionType.String
    })
    name: string,
    @SlashOption({
      description: 'Version of the mod',
      name: 'version',
      required: true,
      type: ApplicationCommandOptionType.String
    })
    version: string,
    @SlashOption({
      description: 'Filename of the mod (Example: ca_whiltonmill_2024.pkz)',
      name: 'filename',
      required: true,
      type: ApplicationCommandOptionType.String
    })
    filename: string,
    @SlashOption({
      description: 'Role for access',
      name: 'role',
      required: false,
      type: ApplicationCommandOptionType.Role
    })
    role: Role | null | undefined,
    interaction: CommandInteraction
  ) {
    if (!(interaction.member instanceof GuildMember)) {
      interaction.reply({
        content: ':x: - Only members can use this command',
        ephemeral: true
      });
      return;
    }

    const isOwner = await this.isOwner(interaction.member);
    const isAdmin = await this.isAdmin(interaction.member);

    if (!isOwner && !isAdmin) {
      interaction.reply({
        content: ":x: - You don't have permission to use this command",
        ephemeral: true
      });
      return;
    }

    try {
      await prisma.mods.create({
        data: {
          name,
          version,
          filename,
          role: role?.id
        }
      });
    } catch (e) {
      console.error(e);
      interaction.reply({ content: ':x: - Internal issue with the database', ephemeral: true });
      return;
    }

    interaction.reply({
      content: `:white_check_mark: - Successfully created mod with name ${name}, version ${version}${role ? `, role ${role.name}` : ''} and filename ${filename}`,
      ephemeral: true
    });
  }

  @SlashGroup('mods')
  @Slash({ description: 'Remove a mod with his name', name: 'remove' })
  async remove(
    @SlashOption({
      description: 'Name of the mod',
      name: 'name',
      required: true,
      type: ApplicationCommandOptionType.String
    })
    name: string,
    @SlashOption({
      description: 'Version of the mod',
      name: 'version',
      required: true,
      type: ApplicationCommandOptionType.String
    })
    version: string,
    interaction: CommandInteraction
  ) {
    if (!(interaction.member instanceof GuildMember)) {
      interaction.reply({
        content: ':x: - Only members can use this command',
        ephemeral: true
      });
      return;
    }

    const isOwner = await this.isOwner(interaction.member);
    const isAdmin = await this.isAdmin(interaction.member);

    if (!isOwner && !isAdmin) {
      interaction.reply({
        content: ":x: - You don't have permission to use this command",
        ephemeral: true
      });
      return;
    }

    try {
      await prisma.mods.delete({
        where: {
          name_version: {
            name,
            version
          }
        }
      });
    } catch (e) {
      console.error(e);
      interaction.reply({ content: ':x: - Internal issue with the database', ephemeral: true });
      return;
    }

    interaction.reply({
      content: `:white_check_mark: - Successfully removed mod with name ${name} and version ${version}`,
      ephemeral: true
    });
  }

  @SlashGroup('mods')
  @Slash({ description: 'List all mods', name: 'list' })
  async list(interaction: CommandInteraction) {
    if (!(interaction.member instanceof GuildMember)) {
      interaction.reply({
        content: ':x: - Only members can use this command',
        ephemeral: true
      });
      return;
    }

    const isOwner = await this.isOwner(interaction.member);
    const isAdmin = await this.isAdmin(interaction.member);

    if (!isOwner && !isAdmin) {
      interaction.reply({
        content: ":x: - You don't have permission to use this command",
        ephemeral: true
      });
      return;
    }

    const mods = await prisma.mods.findMany();

    if (mods.length === 0) {
      interaction.reply({
        content: ':x: - No mods found',
        ephemeral: true
      });
      return;
    }

    const modList = mods
      .map(
        (mod) =>
          `**Name:** ${mod.name}\n**Version:** ${mod.version}\n**Filename:** ${mod.filename}${mod.role ? `\n**Role:** <@&${mod.role}>` : ''}`
      )
      .join('\n\n');
    interaction.reply({
      content: modList,
      ephemeral: true
    });
  }
}
