import { IntentsBitField } from 'discord.js';
import { Client } from 'discordx';

export const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMembers
  ],
  silent: false
});
