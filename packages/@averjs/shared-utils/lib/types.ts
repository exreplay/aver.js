export const isPureObject = (obj: unknown) =>
  !Array.isArray(obj) && typeof obj === 'object';
