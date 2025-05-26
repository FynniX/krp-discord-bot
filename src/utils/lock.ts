import { exec } from 'child_process';

export async function lockFile(guid: string, path: string) {
  const command = [] as string[];
  if (process.platform !== 'win32') command.push('wine');
  command.push('lock.exe');
  command.push(`"${path}"`);
  command.push(`/${guid}`);

  console.log('Run locking command:', command.join(' '));
  return new Promise((resolve, reject) => {
    exec(command.join(' '), (error, stdout) => {
      console.log('Locking stdout:', stdout);

      if (error !== null) {
        console.log('Locking error:', error);
        reject(new Error(stdout.trim()));
        return;
      }

      resolve(stdout.trim());
    });
  });
}
