import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js'
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx'
import { prisma } from '../lib/prisma.js'

@Discord()
@SlashGroup({ name: 'profile', description: 'Configure your profile' })
export class ProfileCommands {
  @SlashGroup('profile')
  @Slash({ description: 'Set a name for your profile', name: 'name' })
  async setName(
    @SlashOption({
      description: 'Full name for your profile',
      name: 'name',
      required: true,
      type: ApplicationCommandOptionType.String
    })
    name: string,
    interaction: CommandInteraction
  ) {
    const member = await prisma.member.findUnique({
      where: { discord: interaction.user.id }
    })

    try {
      if (!member) {
        await prisma.member.create({
          data: {
            discord: interaction.user.id,
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

  @SlashGroup('profile')
  @Slash({ description: 'Set a guid for your profile', name: 'guid' })
  async setGuid(
    @SlashOption({
      description: 'Guid for your profile',
      name: 'guid',
      required: true,
      type: ApplicationCommandOptionType.String
    })
    guid: string,
    interaction: CommandInteraction
  ) {
    const member = await prisma.member.findUnique({
      where: { discord: interaction.user.id }
    })

    // Check weather guid is already set
    if (member?.guid) {
      interaction.reply({
        content: ':x: - You can only set the guid once, contact a admin if you want to change it again.',
        ephemeral: true
      })
      return
    }

    try {
      if (!member) {
        await prisma.member.create({
          data: {
            discord: interaction.user.id,
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
}
