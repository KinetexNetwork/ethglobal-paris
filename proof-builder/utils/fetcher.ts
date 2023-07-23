import { Providers, SupportedNetworks } from '../types/networks.js';
import { resolve } from 'path';

export const getExecutionOutputPath = (
    network: SupportedNetworks,
    blockNumber: string | number,
    postfix: string
) => resolve(`./output/${network}-${blockNumber}-${postfix}.json`);

export const sameDataTypeProviders = [
    Providers.ONFINALITY,
    Providers.QUICKNODE
];
