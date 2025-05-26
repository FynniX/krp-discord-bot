import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js';
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx';
import { prisma } from '../utils/prisma';

@Discord()
@SlashGroup({ name: 'profile', description: 'Configure your profile' })
export class ProfileCommands {
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
    // Check weather guid is valid
    if (!guid.startsWith('FF') || (guid.length !== 18 && guid.length !== 10)) {
      interaction.reply({
        content: ':x: - The guid is not valid.',
        ephemeral: true
      });
      return;
    }

    const member = await prisma.user.findUnique({
      where: { discord: interaction.user.id }
    });

    // Check weather guid is already set
    if (member?.guid) {
      interaction.reply({
        content:
          ':x: - You can only set the guid once, contact a admin if you want to change it again.',
        ephemeral: true
      });
      return;
    }

    try {
      if (!member) {
        await prisma.user.create({
          data: {
            discord: interaction.user.id,
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
}
