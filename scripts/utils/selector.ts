type OptionKey = string;
export type OptionsByKey<Option> = Record<OptionKey, Option>;

type OptionSelectorParams = {
  ignoreCaseKey?: boolean;
}

export class OptionSelector<Option> {
  private readonly target: string;
  private readonly options: OptionsByKey<Option>;
  private readonly ignoreCaseKey: boolean;

  constructor(
    target: string,
    options: OptionsByKey<Option>,
    params: OptionSelectorParams = {},
  ) {
    this.target = target;
    this.ignoreCaseKey = params.ignoreCaseKey ?? false;
    this.options = this.ignoreCaseKey ? OptionSelector.toIgnoreCaseOptions(options) : options;
  }

  public select(key: OptionKey): Option {
    if (this.ignoreCaseKey) {
      key = OptionSelector.toIgnoreCaseKey(key);
    }

    const option = this.options[key];
    if (option == null) {
      const availableKeys: OptionKey[] = Object.keys(this.options);
      throw new Error(`Option "${key}" does not exist for ${this.target}. Available options: ${availableKeys}`);
    }

    return option;
  }

  private static toIgnoreCaseKey(key: OptionKey): OptionKey {
    return key.toLowerCase();
  }

  private static toIgnoreCaseOptions<Option>(options: OptionsByKey<Option>): OptionsByKey<Option> {
    const ignoreCaseEntries = Object.entries(options).map(([k, v]) => [OptionSelector.toIgnoreCaseKey(k), v]);
    return Object.fromEntries(ignoreCaseEntries);
  }
}

const BOOL_OPTION_SELECTOR = new OptionSelector<boolean>(
  'boolean',
  {
    'true': true,
    't': true,
    'yes': true,
    'y': true,
    'false': false,
    'f': false,
    'no': false,
    'n': false,
  },
  {
    ignoreCaseKey: true,
  }
);

export const selectBool = (key: string): boolean => {
  const option = BOOL_OPTION_SELECTOR.select(key);
  return option;
};
