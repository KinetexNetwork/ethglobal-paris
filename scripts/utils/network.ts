import { HardhatRuntimeEnvironment } from 'hardhat/types';

export type NetworkName = string;
export type ParamsByNetworkName<Params> = Record<NetworkName, Params>;

export class NetworkParamsMap<Params> {
  constructor(private readonly target: string, private readonly params: ParamsByNetworkName<Params>) { }

  public getParams(env: HardhatRuntimeEnvironment): Params {
    const network = env.network.name;
    const params = this.params[network];
    if (!params) {
      throw new Error(`No ${this.target} params specified for the "${network}" network`);
    }

    return params;
  }
}
