import { config as dotenv } from "dotenv";

export function getEnv(name: string): string {
  dotenv();
  const env = process.env[name];

  if (env === undefined) {
    throw new Error(`${name} .env variable missing`);
  }

  return env;
}
