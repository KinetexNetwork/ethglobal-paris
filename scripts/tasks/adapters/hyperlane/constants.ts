export enum MAINNET_DOMAIN {
    // mainnet
    arbitrum = 42161,
    avalanche = 43114,
    bsc = 56,
    celo = 42220, 
    ethereum = 1,
    optimism = 10,
    polygon = 137,
    moonbeam = 1284,
    gnosis = 100
}

export enum TESTNET_DOMAIN {
    // testnet
    alfajores = 44787,
    bsc_testnet = 97,
    fuji = 43113,
    goerli = 5,
    sepolia = 11155111,
    mumbai = 80001,
    moonbase_alpha = 1287,
    optimism_goerli = 420,
    arbitrum_goerli = 421613
}

export type HyperlaneAdapterDomainParams = {
    domain: MAINNET_DOMAIN | TESTNET_DOMAIN;
    mailbox: string;
    headerReporter: string;
}

export const HYPERLANE_MAILBOX: Record<MAINNET_DOMAIN | TESTNET_DOMAIN, string> = {
    ...Object.fromEntries(
        Object.keys(MAINNET_DOMAIN).map((key) => [key, '0x35231d4c2D8B8ADcB5617A638A0c4548684c7C70'])
    ) as Record<MAINNET_DOMAIN, string>,
    ...Object.fromEntries(
        Object.keys(TESTNET_DOMAIN).map((key) => [key, '0xCC737a94FecaeC165AbCf12dED095BB13F037685'])
    ) as Record<TESTNET_DOMAIN, string>
}

export const HYPERLANE_DEFAULT_ISM_GAS_PAYMASTER: Record<MAINNET_DOMAIN | TESTNET_DOMAIN, string> = {
    ...Object.fromEntries(
        Object.keys(MAINNET_DOMAIN).map((key) => [key, '0x56f52c0A1ddcD557285f7CBc782D3d83096CE1Cc'])
    ) as Record<MAINNET_DOMAIN, string>,
    ...Object.fromEntries(
        Object.keys(TESTNET_DOMAIN).map((key) => [key, '0xF90cB82a76492614D07B82a7658917f3aC811Ac1'])
    ) as Record<TESTNET_DOMAIN, string>
}

export const HYPERLANE_CUSTOM_GAS_PAYMASTER: Record<MAINNET_DOMAIN | TESTNET_DOMAIN, string> = {
    ...Object.fromEntries(
        Object.keys(MAINNET_DOMAIN).map((key) => [key, '0x6cA0B6D22da47f091B7613223cD4BB03a2d77918'])
    ) as Record<MAINNET_DOMAIN, string>,
    ...Object.fromEntries(
        Object.keys(TESTNET_DOMAIN).map((key) => [key, '0x8f9C3888bFC8a5B25AED115A82eCbb788b196d2a'])
    ) as Record<TESTNET_DOMAIN, string>
}

export const HYPERLANE_QUERY_ROUTER: Record<MAINNET_DOMAIN | TESTNET_DOMAIN, string> = {
    [ MAINNET_DOMAIN.celo ]: '0xA837e38C3F7D509DF3a7a0fCf65E3814DB6c2618',
    [ MAINNET_DOMAIN.ethereum ]: '0x1d9fB4EA1712d0aaF713F7e02Aee0766Bb42bdB0',
    [ MAINNET_DOMAIN.avalanche ]: '0x93CDC5315833F827A92F593a2aAa61e68A95b51b',
    [ MAINNET_DOMAIN.polygon ]: '0x284f71eBF22b7C7bf43aD20c460343D1a2d697c0',
    [ MAINNET_DOMAIN.bsc ]: '0xAD20d715A6544be3f132F96e1cEaAfF016e356D7',
    [ MAINNET_DOMAIN.arbitrum ]: '0x6fa285743afc565Ee99b6D34FE5F298690BC6412',
    [ MAINNET_DOMAIN.optimism ]: '0x5188731eE98892d1e7d98b869D811624dADf94eb',
    [ MAINNET_DOMAIN.moonbeam ]: '0xf1CFA9D0d4191441b1D121144f4027e63bbAE591',
    [ MAINNET_DOMAIN.gnosis ]: '0xA376b27212D608324808923Add679A2c9FAFe9Da',

    [ TESTNET_DOMAIN.alfajores ]: '0xc341cBC69745C541d698cb2cB4eDb91c2F0413aE',
    [ TESTNET_DOMAIN.fuji ]: '0x7192d5Ad540E9fEfc3FD1845d41c18EE86980AAb',
    [ TESTNET_DOMAIN.mumbai ]: '0xD786eC480Da58792175c9DDEdD99802Badf1037E',
    [ TESTNET_DOMAIN.bsc_testnet ]: '0x6117c92e1D05fD23Adc6077bA0d2956EE3175984',
    [ TESTNET_DOMAIN.goerli ]: '0x46A2B1C3E8a93C3613Ebf326235FbD3e2f65660F',
    [ TESTNET_DOMAIN.moonbase_alpha ]: '0xFB03bC45D20848F94DAF6884A92795dd44dDE241',
    [ TESTNET_DOMAIN.optimism_goerli ]: '0x6385E09099d889f912F90c47F10E903fe4feBF69',
    [ TESTNET_DOMAIN.arbitrum_goerli ]: '0x5b1E05e1fdDBc0f3d31c4E634ff4D5d84A56deEe',
    [ TESTNET_DOMAIN.sepolia ]: '0x507C18fa4e3b0ce6beBD494488D62d1ed0fB0555'
}