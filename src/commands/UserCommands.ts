import { ApplicationCommandOptionType, CommandInteraction, GuildMember } from 'discord.js';
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx';
import { prisma } from '../utils/prisma';
import { client } from '../utils/discord';
import { getEnv } from '../utils/env';

@Discord()
@SlashGroup({ name: 'members', description: 'Manage your members' })
@SlashGroup({ name: 'guids', description: 'Manage guids for members', root: 'members' })
export class UserCommands {
  private async isOwner(member: GuildMember) {
    const guild = await client.guilds.fetch(getEnv('GUILD_ID'));
    return guild.ownerId === member.id;
  }

  private async isAdmin(member: GuildMember) {
    const user = await prisma.user.findUnique({ where: { discord: member.id } });
    return user?.admin ?? false;
  }

  @SlashGroup('members')
  @Slash({ description: 'Can enable/disable a member to be an admin', name: 'admin' })
  async toggleAdmin(
    @SlashOption({
      description: 'User',
      name: 'user',
      required: true,
      type: ApplicationCommandOptionType.User
    })
    user: GuildMember,
    @SlashOption({
      description: 'True = is admin, false = is not admin',
      name: 'admin',
      required: true,
      type: ApplicationCommandOptionType.Boolean
    })
    admin: boolean,
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

    const member = await prisma.user.findUnique({
      where: { discord: user.id }
    });

    try {
      if (!member) {
        await prisma.user.create({
          data: {
            discord: user.id,
            admin
          }
        });
      } else {
        await prisma.user.update({
          where: { discord: member.discord },
          data: { admin }
        });
      }
    } catch (e) {
      console.error(e);
      interaction.reply({ content: ':x: - Internal issue with the database', ephemeral: true });
      return;
    }

    interaction.reply({
      content: `:white_check_mark: - Successfully ${admin ? 'enabled' : 'disabled'} admin permissions`,
      ephemeral: true
    });
  }

  @SlashGroup('guids', 'members')
  @Slash({ description: 'Can set the guid for a member', name: 'set' })
  async setGuid(
    @SlashOption({
      description: 'User',
      name: 'user',
      required: true,
      type: ApplicationCommandOptionType.User
    })
    user: GuildMember,
    @SlashOption({
      description: 'Guid',
      name: 'guid',
      required: true,
      type: ApplicationCommandOptionType.String
    })
    guid: string,
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

    // Check weather guid is valid
    if (!guid.startsWith('FF') || (guid.length !== 18 && guid.length !== 10)) {
      interaction.reply({
        content: ':x: - The guid is not valid.',
        ephemeral: true
      });
      return;
    }

    const member = await prisma.user.findUnique({
      where: { discord: user.id }
    });

    try {
      if (!member) {
        await prisma.user.create({
          data: {
            discord: user.id,
            guid
          }
        });
      } else {
        await prisma.user.update({
          where: { discord: member.discord },
          data: { guid }
        });
      }
    } catch (e) {
      console.error(e);
      interaction.reply({ content: ':x: - Internal issue with the database', ephemeral: true });
      return;
    }

    interaction.reply({
      content: ':white_check_mark: - Successfully set the guid',
      ephemeral: true
    });
  }

  @SlashGroup('guids', 'members')
  @Slash({ description: 'Can reset the guid for a member', name: 'reset' })
  async resetGuid(
    @SlashOption({
      description: 'User',
      name: 'user',
      required: true,
      type: ApplicationCommandOptionType.User
    })
    user: GuildMember,
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

    const member = await prisma.user.findUnique({
      where: { discord: user.id }
    });

    try {
      if (!member) {
        await prisma.user.create({
          data: {
            discord: user.id
          }
        });
      } else {
        await prisma.user.update({
          where: { discord: member.discord },
          data: { guid: null }
        });
      }
    } catch (e) {
      console.error(e);
      interaction.reply({ content: ':x: - Internal issue with the database', ephemeral: true });
      return;
    }

    interaction.reply({
      content: ':white_check_mark: - Successfully reset the guid',
      ephemeral: true
    });
  }

  @SlashGroup('guids', 'members')
  @Slash({ description: 'Can get the guid of a member', name: 'get' })
  async getGuid(
    @SlashOption({
      description: 'User',
      name: 'user',
      required: true,
      type: ApplicationCommandOptionType.User
    })
    user: GuildMember,
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

    const member = await prisma.user.findUnique({
      where: { discord: user.id }
    });

    if (!member?.guid) {
      interaction.reply({
        content: ':x: - This user has no guid set',
        ephemeral: true
      });
      return;
    }

    interaction.reply({ content: `:white_check_mark: - Guid: ${member.guid}`, ephemeral: true });
  }
}
