import { ApplicationCommandOptionType, CommandInteraction, Role } from 'discord.js'
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx'
import { prisma } from '../lib/prisma.js'
import { getGuild } from '../utils/guild.js'

@Discord()
@SlashGroup({ name: 'mods', description: 'Manage your mods' })
export class ModsCommands {
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
      description: 'Role for access',
      name: 'role',
      required: true,
      type: ApplicationCommandOptionType.Role
    })
    role: Role,
    @SlashOption({
      description: 'Filename of the mod (Example: ca_whiltonmill_2024.pkz)',
      name: 'filename',
      required: true,
      type: ApplicationCommandOptionType.String
    })
    filename: string,
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

    try {
      await prisma.mods.create({
        data: {
          name,
          version,
          role: role.id,
          filename
        }
      })
    } catch (err) {
      interaction.reply({ content: ':x: - Internal issue with the database', ephemeral: true })
      return
    }

    interaction.reply({
      content: `:white_check_mark: - Successfully created mod with name ${name}, version ${version}, role ${role.name} and filename ${filename}`,
      ephemeral: true
    })
  }

  @SlashGroup('mods')
  @Slash({
    description: 'Create a mod that can be encrypted later on only accessible by patreon role',
    name: 'create-patreon'
  })
  async createPatreon(
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

    try {
      await prisma.mods.create({
        data: {
          name,
          version,
          filename
        }
      })
    } catch (err) {
      interaction.reply({ content: ':x: - Internal issue with the database', ephemeral: true })
      return
    }

    interaction.reply({
      content: `:white_check_mark: - Successfully created mod with name ${name}, version ${version} and filename ${filename}`,
      ephemeral: true
    })
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

    try {
      await prisma.mods.delete({
        where: {
          name_version: {
            name,
            version
          }
        }
      })
    } catch (err) {
      interaction.reply({ content: ':x: - Internal issue with the database', ephemeral: true })
      return
    }

    interaction.reply({
      content: `:white_check_mark: - Successfully removed mod with name ${name} and version ${version}`,
      ephemeral: true
    })
  }
}
