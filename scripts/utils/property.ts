const INDENT_PER_LEVEL = 2;

export type Property = {
  title: string;
  value: string | Property[];
}

type LogPropertyGroupArgs = {
  title: string;
  properties: Property[];
}

export const logPropertyGroup = (args: LogPropertyGroupArgs): void => {
  logProperties({ title: args.title, properties: args.properties, baseIndent: 0, newLine: true });
}

const spaces = (count: number): string => {
  return ' '.repeat(count);
};

type LogPropertiesArgs = {
  title: string;
  properties: Property[];
  baseIndent: number;
  newLine: boolean;
}

const logProperties = (args: LogPropertiesArgs): void => {
  const maxPropertyTitleLength = args.properties.reduce((max, prop) => Math.max(prop.title.length, max), 0);
  const titleSuffix = args.properties.length > 0 ? ':' : '';

  console.log(spaces(args.baseIndent) + args.title + titleSuffix);
  for (const property of args.properties) {
    const extraGap = maxPropertyTitleLength - property.title.length;
    logProperty({ property, indent: args.baseIndent + INDENT_PER_LEVEL, extraGap });
  }
  if (args.newLine) {
    console.log();
  }
};

type LogPropertyArgs = {
  property: Property;
  indent: number;
  extraGap: number;
}

const logProperty = (args: LogPropertyArgs): void => {
  if (Array.isArray(args.property.value)) {
    logProperties({
      title: args.property.title,
      properties: args.property.value,
      baseIndent: args.indent,
      newLine: false,
    });
    return;
  }

  console.log(
    spaces(args.indent) +
    args.property.title +
    spaces(args.extraGap) +
    ' -- ' +
    args.property.value
  );
};
