export const safeGetConfig = (configKey: string): string => {
  const val = process.env[configKey];
  if (val === undefined || val === null) {
    throw new Error(configKey + ' is required in .env file');
  }
  return val;
};