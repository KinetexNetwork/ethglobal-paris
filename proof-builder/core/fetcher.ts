import axios from 'axios';
import { buildEndpoint } from '../utils/network.js';
import { Providers, SupportedNetworks } from '../types/networks.js';

export class Fetcher {
    network: SupportedNetworks;

    constructor(network: SupportedNetworks, encoded: boolean) {
        this.network = network;
        this.configureAxios(encoded);
    }

    configureAxios(encoded: boolean) {
        axios.defaults.baseURL = buildEndpoint(this.network).url;
        axios.defaults.maxContentLength = Infinity;
        axios.defaults.maxBodyLength = Infinity;
        axios.defaults.headers.common = {
            // todo: why is the Beacon API returning undefined for SSZ?
            'Content-Type': encoded
                ? 'application/octet-stream'
                : 'application/json',
            accept: encoded ? 'application/octet-stream' : 'application/json'
        };
    }

    async runApi(method: () => any) {
        try {
            return (await method()).data.data;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Unknown error. Check your api config');
        }
    }

    async runCall(method: () => any) {
        try {
            return (await method()).data.result;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Unknown error. Check your api config');
        }
    }

    async callEthMethod(
        methodName: string,
        params: any[],
        network: SupportedNetworks
    ) {
        const { url, provider } = buildEndpoint(network);

        if (provider === Providers.QUICKNODE) {
            return axios.post(
                url,
                JSON.stringify({
                    method: methodName,
                    params,
                    id: 1,
                    jsonrpc: '2.0'
                })
            );
        }

        if (provider === Providers.ONFINALITY) {
            return axios.post(url, {
                method: methodName,
                params,
                id: 1,
                jsonrpc: '2.0'
            });
        }

        throw new Error('Unknown provider');
    }
}
