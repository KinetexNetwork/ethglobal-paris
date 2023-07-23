import { SupportedNetworks } from '../networks';
import { CeloHeader } from './celoBlock';
import { EthereumHeader } from './ethereumBlock';

export type BlockHeader<T extends SupportedNetworks> =
    T extends SupportedNetworks.CELO
        ? CeloHeader
        : T extends SupportedNetworks.MAINNET
        ? EthereumHeader
        : never;
