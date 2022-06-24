export function getRequiredEnvVariable(name: string): string {
  const variable = process.env[name];

  if (!variable) {
    throw new Error(`Environment variable ${name} is not set`);
  }

  return variable;
}
