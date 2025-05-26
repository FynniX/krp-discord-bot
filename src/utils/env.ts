export function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Environment variable ${key} is not set`);
  return value;
}

export function getEnvAsNumber(key: string): number {
  return parseInt(getEnv(key));
}
