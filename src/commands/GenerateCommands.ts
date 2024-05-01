import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  MessageActionRowComponentBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction
} from 'discord.js'
import { Discord, SelectMenuComponent, Slash } from 'discordx'
import { prisma } from '../lib/prisma.js'
import { ModSelection } from '../interfaces/ModSelection.js'
import { createGenerator } from '../lib/generator.js'
import { GeneratorMessage } from '../interfaces/GeneratorMessage.js'
import { ProcessMessage } from '../enums/ProcessMessage.js'
import { guild, members } from '../utils/guild.js'

@Discord()
export class GenerateCommands {
  private static activeThreads = 0

  private async waitForThread(): Promise<void> {
    return new Promise((resolve) => {
      const id = setInterval(() => {
        if (GenerateCommands.activeThreads >= parseInt(process.env.MAX_THREADS || '0')) return
        clearInterval(id)
        resolve()
      }, 2000)
    })
  }

  private async getMods(): Promise<ModSelection[]> {
    // Generate select menu for mod
    const mods = await prisma.mods.findMany()

    if (!mods || mods.length === 0) return []

    return mods.map((mod) => ({ label: `${mod.name} - ${mod.version}`, value: mod.id.toFixed(0) }))
  }

  @Slash({ description: 'Generate a mod', name: 'generate' })
  async generate(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true })

    const member = await prisma.member.findUnique({
      where: { discord: interaction.user.id }
    })

    if (!member) {
      interaction.editReply({ content: ":x: - Member wasn't found in the database" })
      return
    }

    if (!member.name) {
      interaction.editReply({ content: ':x: - You need to set your name first' })
      return
    }

    if (!member.guid) {
      interaction.editReply({ content: ':x: - You need to set your guid first' })
      return
    }

    // Generate select menu for mod
    const mods = await this.getMods()

    if (mods.length === 0) {
      interaction.editReply({ content: ':x: - There is currently no mod available' })
      return
    }

    // Creating menu for selecting mod and version
    const menu = new StringSelectMenuBuilder().addOptions(mods).setCustomId('mod-selection')

    const buttonRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(menu)

    interaction.editReply({
      components: [buttonRow],
      content: 'Select the requested mod'
    })
  }

  @SelectMenuComponent({ id: 'mod-selection' })
  async selection(interaction: StringSelectMenuInteraction) {
    await interaction.deferReply({ ephemeral: true })

    const modId = interaction.values?.[0]

    if (!modId) {
      // Generate select menu for mod
      const mods = await this.getMods()

      if (mods.length === 0) {
        interaction.followUp({ content: ':x: - There is currently no mod available', ephemeral: true })
        return
      }

      // Creating menu for selecting mod and version
      const menu = new StringSelectMenuBuilder().addOptions(mods).setCustomId('mod-selection')

      const buttonRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(menu)

      interaction.editReply({
        components: [buttonRow],
        content: ':x: - Mod not found, select again'
      })

      return
    }

    const member = await prisma.member.findUnique({
      where: { discord: interaction.user.id }
    })

    if (!member) {
      interaction.editReply({ content: ":x: - Member wasn't found in the database" })
      return
    }

    if (!member.name) {
      interaction.editReply({ content: ':x: - You need to set your name first' })
      return
    }

    if (!member.guid) {
      interaction.editReply({ content: ':x: - You need to set your guid first' })
      return
    }

    const mods = await prisma.mods.findUnique({
      where: { id: parseInt(modId) }
    })

    if (!mods) {
      interaction.editReply({ content: ':x: - Mod not found' })
      return
    }

    const guildMember = members?.get(interaction.user.id)
    const isPatreon = guildMember?.roles.cache.some((r) => r.id === process.env.PATREON_ROLE) ?? false
    const hasAccess = !mods.role ? false : guildMember?.roles.cache.some((r) => r.id === mods.role)
    if (!hasAccess && !isPatreon && !member.isAdmin && guild?.ownerId !== interaction.user.id) {
      interaction.editReply({ content: ":x: - You don't have access to this mod" })
      return
    }

    interaction.editReply({ content: 'Waiting for free thread...' })
    await this.waitForThread()

    const child = createGenerator()

    child.on('message', (message: GeneratorMessage) => {
      switch (message.type) {
        case ProcessMessage.Progress:
          interaction.editReply(`Generating ${message.progress}%`)
          break
        case ProcessMessage.Result:
          if (message.success) {
            const button = new ButtonBuilder()
              .setLabel('Download')
              .setStyle(ButtonStyle.Link)
              .setURL(`${process.env.WEBSERVER_URL}/${message.filename}`)

            const buttonRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(button)

            interaction.editReply({
              content: 'Mod was generated successfully.\nYou can now download it via the button bellow.\n',
              components: [buttonRow]
            })
          } else {
            interaction.editReply({ content: `:x: - ${message.message}` })
          }

          child.send({ type: ProcessMessage.End })
          break
        default:
          child.send({ type: ProcessMessage.End })
      }
    })

    child.on('close', () => {
      GenerateCommands.activeThreads--
    })

    child.send({ type: ProcessMessage.Start, memberId: member.id, modId: parseInt(modId) })
    GenerateCommands.activeThreads++

    setTimeout(
      () => {
        child.send({ type: ProcessMessage.End })
        interaction.editReply({
          content: ':x: - Something went wrong, please contact a admin!'
        })
      },
      1000 * 60 * 5
    )
  }
}
