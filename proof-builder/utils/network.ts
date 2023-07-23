import { Providers, SupportedNetworks } from '../types/networks.js';
import { Nullable } from '../types/helpers.js';

export const getNetwork = (network: Nullable<string>): SupportedNetworks => {
    if (!network) {
        throw new Error(
            'No network argument. Pass the current network with --network arg'
        );
    }

    try {
        return SupportedNetworks[
            network.toUpperCase() as keyof typeof SupportedNetworks
        ];
    } catch (error) {
        throw new Error('Unsupported network');
    }
};

export const getChainId = (
    network: Nullable<string>,
    asBigInt: boolean = false
): number | bigint => {
    if (!network) {
        throw new Error(
            'No network argument. Pass the current network with --network arg'
        );
    }

    switch (network) {
        case SupportedNetworks.GNOSIS:
            return asBigInt ? 100n : 100;

        case SupportedNetworks.GOERLI:
            return asBigInt ? 5n : 5;

        case SupportedNetworks.MAINNET:
            return asBigInt ? 1 : 1n;

        case SupportedNetworks.ARBITRUM:
            return asBigInt ? 42161 : 42161n;

        case SupportedNetworks.OPTIMISM:
            return asBigInt ? 10 : 10n;

        case SupportedNetworks.ZKSYNC:
            return asBigInt ? 324 : 324n;

        default:
            throw new Error('Unsupported network');
    }
};

export const getProvider = (provider: Nullable<string>): Providers => {
    if (!provider) {
        throw new Error('Passed in provider does not exist');
    }

    try {
        return Providers[provider.toUpperCase() as keyof typeof Providers];
    } catch (error) {
        throw new Error('Unsupported network');
    }
};

export const buildEndpoint = (
    network: SupportedNetworks
): { url: string; provider: Providers } => {
    const providerPreference = getProvider(process.env.PROVIDER_PREFERENCE);
    const quiknodeDomain = process.env.QUICKNODE_DOMAIN;
    const quiknodeKey = process.env.QUICKNODE_KEY;
    const onfinalityKey = process.env.ONFINALITY_KEY;

    if (!quiknodeDomain || !quiknodeKey) {
        throw new Error('Quicknode settings not set');
    }

    switch (network) {
        case SupportedNetworks.MAINNET:
            if (providerPreference === Providers.QUICKNODE) {
                return {
                    url: `https://${quiknodeDomain}.ethereum.quiknode.pro/${quiknodeKey}/`,
                    provider: Providers.QUICKNODE
                };
            }

            return {
                url: `https://eth.api.onfinality.io/rpc?apikey=${onfinalityKey}`,
                provider: Providers.ONFINALITY
            };

        case SupportedNetworks.ARBITRUM:
            if (providerPreference === Providers.QUICKNODE) {
                return {
                    url: `https://${quiknodeDomain}.arbitrum-mainnet.quiknode.pro/${quiknodeKey}/`,
                    provider: Providers.QUICKNODE
                };
            }

            return {
                url: `https://arbitrum.api.onfinality.io/rpc?apikey=${onfinalityKey}`,
                provider: Providers.ONFINALITY
            };

        case SupportedNetworks.AVALANCHE:
            return {
                url: `https://avalanche.api.onfinality.io/ext/bc/C/rpc?apikey=${onfinalityKey}`,
                provider: Providers.ONFINALITY
            };

        case SupportedNetworks.FANTOM:
            return {
                url: `https://fantom.api.onfinality.io/rpc?apikey=${onfinalityKey}`,
                provider: Providers.ONFINALITY
            };

        case SupportedNetworks.BNB:
            return {
                url: `https://bnb.api.onfinality.io/rpc?apikey=${onfinalityKey}`,
                provider: Providers.ONFINALITY
            };

        case SupportedNetworks.POLYGON:
            return {
                url: `https://polygon.api.onfinality.io/rpc?apikey=${onfinalityKey}`,
                provider: Providers.ONFINALITY
            };

        case SupportedNetworks.OPTIMISM:
            if (providerPreference === Providers.QUICKNODE) {
                return {
                    url: `https://${quiknodeDomain}.optimism.quiknode.pro/${quiknodeKey}/`,
                    provider: Providers.QUICKNODE
                };
            }

            return {
                url: `https://optimism.api.onfinality.io/rpc?apikey=${onfinalityKey}`,
                provider: Providers.ONFINALITY
            };

        case SupportedNetworks.GNOSIS:
            return {
                url: `https://${quiknodeDomain}.xdai.discover.quiknode.pro/${quiknodeKey}/`,
                provider: Providers.QUICKNODE
            };

        case SupportedNetworks.CHIADO:
            return {
                url: `https://${quiknodeDomain}.xdai-chiado.discover.quiknode.pro/${quiknodeKey}/`,
                provider: Providers.QUICKNODE
            };

        case SupportedNetworks.ZKSYNC:
            return {
                url: `https://zksync-era.rpc.thirdweb.com`,
                // TODO
                provider: Providers.ONFINALITY
            };

        case SupportedNetworks['POLYGON-ZK']:
            return {
                url: `https://${quiknodeDomain}.zkevm-mainnet.quiknode.pro/${quiknodeKey}/`,
                provider: Providers.QUICKNODE
            };

        case SupportedNetworks.LINEA:
            return {
                url: `https://rpc.goerli.linea.build `,
                // TODO
                provider: Providers.ONFINALITY
            };

        case SupportedNetworks.CELO:
            if (providerPreference === Providers.QUICKNODE) {
                return {
                    url: `https://${quiknodeDomain}.celo-mainnet.quiknode.pro/${quiknodeKey}/`,
                    provider: Providers.QUICKNODE
                };
            }

            return {
                url: `https://celo.api.onfinality.io/rpc?apikey=${onfinalityKey}`,
                provider: Providers.ONFINALITY
            };

        case SupportedNetworks.GOERLI:
            return {
                url: `https://${quiknodeDomain}.ethereum-goerli.quiknode.pro/${quiknodeKey}/`,
                provider: Providers.QUICKNODE
            };

        default:
            throw new Error('Unsupported network');
    }
};
