export const required = <T>(name: string, value: T | null | undefined): T => {
  if (value == null) {
    throw new Error(`Unexpected nullish value of ${name}`);
  }
  return value;
};
