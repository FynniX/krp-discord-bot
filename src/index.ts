import 'dotenv/config';
import { client } from './utils/discord';
import { getEnv, getEnvAsNumber } from './utils/env';
import { app } from './utils/express';
import { setupFolder } from './utils/mods';

import './commands/GenerateCommands';
import './commands/ModsCommands';
import './commands/ProfileCommands';
import './commands/UserCommands';
import { resolve } from 'path';
import { readdir, rm } from 'fs/promises';
import { createReadStream, existsSync } from 'fs';

// Setup Bot
client.on('ready', async () => {
  console.log(`>> Bot started as ${client.user?.tag}!`);

  // Init Create/Update/Remove Commands
  await client.initApplicationCommands();

  // Setup Mods Folder
  setupFolder();

  const publicRoot = resolve(dirroot, 'public');

  // Delete public subfolder every hour
  const emptyPublicFolder = async () => {
    const content = await readdir(publicRoot, { withFileTypes: true });
    for (const file of content)
      await rm(resolve(publicRoot, file.name), { recursive: true }).catch(console.error);
  };

  emptyPublicFolder();
  setInterval(emptyPublicFolder, 1000 * 60 * 60); // Every hour

  // Route for downloading file
  app.get('/:uuid/:filename', async (req, res) => {
    const { uuid, filename } = req.params;

    // Check if uuid and filename are valid
    console.log(`>> Download request for UUID: ${uuid}, Filename: ${filename}`);

    if (
      uuid.includes('..') ||
      uuid.includes('/') ||
      uuid.includes('\\') ||
      filename.includes('..') ||
      filename.includes('/') ||
      filename.includes('\\')
    ) {
      res.status(400).send('Invalid UUID or filename!');
      return;
    }

    // Get file path
    const folderpath = resolve(publicRoot, uuid);
    const filepath = resolve(folderpath, filename);
    if (!existsSync(filepath)) {
      res.status(404).send('File not found!');
      return;
    }

    // Create stream and remove folder afterwards
    createReadStream(filepath).pipe(res);
    await rm(folderpath, { recursive: true }).catch(console.error);
  });

  // Start Server
  const port = getEnvAsNumber('SERVER_PORT');
  app.listen(port, () => console.log(`>> Server started on port ${port}`));
});

client.on('interactionCreate', client.executeInteraction);

// Start Bot
client.login(getEnv('BOT_TOKEN'));

export const dirroot = resolve(__dirname, '..');
