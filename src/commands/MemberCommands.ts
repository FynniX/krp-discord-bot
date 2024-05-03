import { ApplicationCommandOptionType, CommandInteraction, GuildMember } from 'discord.js'
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx'
import { prisma } from '../lib/prisma.js'
import { getGuild } from '../utils/guild.js'

@Discord()
@SlashGroup({ name: 'members', description: 'Manage your members' })
@SlashGroup({ name: 'names', description: 'Manage names for members', root: 'members' })
@SlashGroup({ name: 'guids', description: 'Manage guids for members', root: 'members' })
export class MemberCommands {
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
    isAdmin: boolean,
    interaction: CommandInteraction
  ) {
    const commandSender = await prisma.member.findUnique({
      where: {
        discord: interaction.user.id,
        isAdmin: true
      }
    })

    // Check weather command sender has permissions or is admin
    if ((await getGuild())?.ownerId !== interaction.user.id && !commandSender) {
      interaction.reply({ content: ":x: - You don't have permission to use this command", ephemeral: true })
      return
    }

    const member = await prisma.member.findUnique({
      where: { discord: user.id }
    })

    try {
      if (!member) {
        await prisma.member.create({
          data: {
            discord: user.id,
            isAdmin
          }
        })
      } else {
        await prisma.member.update({
          where: { id: member.id },
          data: { isAdmin }
        })
      }
    } catch (err) {
      interaction.reply({ content: ':x: - Internal issue with the database', ephemeral: true })
      return
    }

    interaction.reply({
      content: `:white_check_mark: - Successfully ${isAdmin ? 'enabled' : 'disabled'} admin permissions`,
      ephemeral: true
    })
  }

  @SlashGroup('names', 'members')
  @Slash({ description: 'Can set the name for a member', name: 'set' })
  async setName(
    @SlashOption({
      description: 'User',
      name: 'user',
      required: true,
      type: ApplicationCommandOptionType.User
    })
    user: GuildMember,
    @SlashOption({
      description: 'Name',
      name: 'name',
      required: true,
      type: ApplicationCommandOptionType.String
    })
    name: string,
    interaction: CommandInteraction
  ) {
    const commandSender = await prisma.member.findUnique({
      where: {
        discord: interaction.user.id,
        isAdmin: true
      }
    })

    // Check weather command sender has permissions or is admin
    if ((await getGuild())?.ownerId !== interaction.user.id && !commandSender) {
      interaction.reply({ content: ":x: - You don't have permission to use this command", ephemeral: true })
      return
    }

    const member = await prisma.member.findUnique({
      where: { discord: user.id }
    })

    try {
      if (!member) {
        await prisma.member.create({
          data: {
            discord: user.id,
            name
          }
        })
      } else {
        await prisma.member.update({
          where: { id: member.id },
          data: { name }
        })
      }
    } catch (err) {
      interaction.reply({ content: ':x: - Internal issue with the database', ephemeral: true })
      return
    }

    interaction.reply({ content: ':white_check_mark: - Successfully set the name', ephemeral: true })
  }

  @SlashGroup('names', 'members')
  @Slash({ description: 'Can reset the name for a member', name: 'reset' })
  async resetName(
    @SlashOption({
      description: 'User',
      name: 'user',
      required: true,
      type: ApplicationCommandOptionType.User
    })
    user: GuildMember,
    interaction: CommandInteraction
  ) {
    const commandSender = await prisma.member.findUnique({
      where: {
        discord: interaction.user.id,
        isAdmin: true
      }
    })

    // Check weather command sender has permissions or is admin
    if ((await getGuild())?.ownerId !== interaction.user.id && !commandSender) {
      interaction.reply({ content: ":x: - You don't have permission to use this command", ephemeral: true })
      return
    }

    const member = await prisma.member.findUnique({
      where: { discord: user.id }
    })

    try {
      if (!member) {
        await prisma.member.create({
          data: {
            discord: user.id
          }
        })
      } else {
        await prisma.member.update({
          where: { id: member.id },
          data: { name: null }
        })
      }
    } catch (err) {
      interaction.reply({ content: ':x: - Internal issue with the database', ephemeral: true })
      return
    }

    interaction.reply({ content: ':white_check_mark: - Successfully reset the name', ephemeral: true })
  }

  @SlashGroup('names', 'members')
  @Slash({ description: 'Can get the name of a member', name: 'get' })
  async getName(
    @SlashOption({
      description: 'User',
      name: 'user',
      required: true,
      type: ApplicationCommandOptionType.User
    })
    user: GuildMember,
    interaction: CommandInteraction
  ) {
    const commandSender = await prisma.member.findUnique({
      where: {
        discord: interaction.user.id,
        isAdmin: true
      }
    })

    // Check weather command sender has permissions or is admin
    if ((await getGuild())?.ownerId !== interaction.user.id && !commandSender) {
      interaction.reply({ content: ":x: - You don't have permission to use this command", ephemeral: true })
      return
    }

    const member = await prisma.member.findUnique({
      where: { discord: user.id }
    })

    if (!member) {
      interaction.reply({ content: ":x: - Member wasn't found in the database", ephemeral: true })
      return
    }

    interaction.reply({ content: `:white_check_mark: - Name: ${member.name || 'None'}`, ephemeral: true })
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
    const commandSender = await prisma.member.findUnique({
      where: {
        discord: interaction.user.id,
        isAdmin: true
      }
    })

    // Check weather command sender has permissions or is admin
    if ((await getGuild())?.ownerId !== interaction.user.id && !commandSender) {
      interaction.reply({ content: ":x: - You don't have permission to use this command", ephemeral: true })
      return
    }

    const member = await prisma.member.findUnique({
      where: { discord: user.id }
    })

    try {
      if (!member) {
        await prisma.member.create({
          data: {
            discord: user.id,
            guid
          }
        })
      } else {
        await prisma.member.update({
          where: { id: member.id },
          data: { guid }
        })
      }
    } catch (err) {
      interaction.reply({ content: ':x: - Internal issue with the database', ephemeral: true })
      return
    }

    interaction.reply({ content: ':white_check_mark: - Successfully set the guid', ephemeral: true })
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
    const commandSender = await prisma.member.findUnique({
      where: {
        discord: interaction.user.id,
        isAdmin: true
      }
    })

    // Check weather command sender has permissions or is admin
    if ((await getGuild())?.ownerId !== interaction.user.id && !commandSender) {
      interaction.reply({ content: ":x: - You don't have permission to use this command", ephemeral: true })
      return
    }

    const member = await prisma.member.findUnique({
      where: { discord: user.id }
    })

    try {
      if (!member) {
        await prisma.member.create({
          data: {
            discord: user.id
          }
        })
      } else {
        await prisma.member.update({
          where: { id: member.id },
          data: { guid: null }
        })
      }
    } catch (err) {
      interaction.reply({ content: ':x: - Internal issue with the database', ephemeral: true })
      return
    }

    interaction.reply({ content: ':white_check_mark: - Successfully reset the guid', ephemeral: true })
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
    const commandSender = await prisma.member.findUnique({
      where: {
        discord: interaction.user.id,
        isAdmin: true
      }
    })

    // Check weather command sender has permissions or is admin
    if ((await getGuild())?.ownerId !== interaction.user.id && !commandSender) {
      interaction.reply({ content: ":x: - You don't have permission to use this command", ephemeral: true })
      return
    }

    const member = await prisma.member.findUnique({
      where: { discord: user.id }
    })

    if (!member) {
      interaction.reply({ content: ":x: - Member wasn't found in the database", ephemeral: true })
      return
    }

    interaction.reply({ content: `:white_check_mark: - Guid: ${member.guid || 'None'}`, ephemeral: true })
  }
}
