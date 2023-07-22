import { task } from 'hardhat/config';

task('x-deployer', 'Prints active deployer account info')
  .setAction(async (args, env) => {
    const { deployerInfo } = await import('./deployer/info');
    await deployerInfo(args, env);
  });

task('x-hashi-hyperlane-adapter-deploy', 'Deploys HyperlaneAdapter')
  .addParam('domains', 'List of supported domains')
  .addParam('headerReporters', 'List of HeaderReporter contracts addresses')
  .addFlag('dry', 'Perform a dry run (estimate only)')
  .addOptionalParam('nonce', 'Nonce override')
  .setAction(async (args, env) => {
    const { hyperlaneAdapterDeploy } = await import('./adapters/hyperlane/deploy-adapter');
    await hyperlaneAdapterDeploy(args, env);
  });

task('x-hashi-hyperlane-headerreporter-deploy', 'Deploys HyperlaneHeaderReporter')
  .addParam('targetDomain', 'Target HyperlaneAdapter domain')
  .addParam('targetAdapter', 'Target HyperlaneAdapter address')
  .addFlag('dry', 'Perform a dry run (estimate only)')
  .addOptionalParam('nonce', 'Nonce override')
  .setAction(async (args, env) => {
    const { hyperlaneHeaderReporterDeploy } = await import('./adapters/hyperlane/deploy-header-reporter');
    await hyperlaneHeaderReporterDeploy(args, env);
  });

task('x-hashi-hyperlane-queryadapter-deploy', 'Deploys HyperlaneQueryAdapter')
  .addParam('domains', 'List of supported domains')
  .addParam('headerReporters', 'List of HeaderReporter contracts addresses')
  .addFlag('dry', 'Perform a dry run (estimate only)')
  .addOptionalParam('nonce', 'Nonce override')
  .setAction(async (args, env) => {
    const { hyperlaneQueryAdapterDeploy } = await import('./adapters/hyperlane/deploy-query-adapter');
    await hyperlaneQueryAdapterDeploy(args, env);
  });

task('x-hashi-hyperlane-report-header', 'Report header from HyperlaneHeaderReporter')
  .addParam('headerReporter', 'HyperlaneHeaderReporter contract address')
  .addParam('blockNumber', 'Block number')
  .addFlag('dry', 'Perform a dry run (estimate only)')
  .addOptionalParam('nonce', 'Nonce override')
  .setAction(async (args, env) => {
    const { hyperlaneReportHeader } = await import('./adapters/hyperlane/report-header');
    await hyperlaneReportHeader(args, env);
  });

task('x-hashi-hyperlane-query-header', 'Report header from HyperlaneHeaderReporter')
  .addParam('queryAdapter', 'HyperlaneQueryAdapter contract address')
  .addParam('domain', 'Origin chain')
  .addParam('blockNumber', 'Block number')
  .addFlag('dry', 'Perform a dry run (estimate only)')
  .addOptionalParam('nonce', 'Nonce override')
  .setAction(async (args, env) => {
    const { hyperlaneQueryHeader } = await import('./adapters/hyperlane/query-header');
    await hyperlaneQueryHeader(args, env);
  });






task('x-flash-light-deploy', 'Deploys KinetexFlashLight')
  .addFlag('dry', 'Perform a dry run (estimate only)')
  .addOptionalParam('nonce', 'Nonce override')
  .setAction(async (args, env) => {
    const { flashLightDeploy } = await import('./flash-light/deploy');
    await flashLightDeploy(args, env);
  });

task('x-proof-verifier-deploy', 'Deploys ProofVerifier')
  .addOptionalParam('chain', 'Chain IDs (comma-separated list)')
  .addOptionalParam('lightClient', 'LightClient contract addresses (comma-separated list)')
  .addOptionalParam('broadcaster', 'Broadcaster contract addresses (comma-separated list)')
  .addFlag('dry', 'Perform a dry run (estimate only)')
  .addOptionalParam('nonce', 'Nonce override')
  .setAction(async (args, env) => {
    const { proofVerifierDeploy } = await import('./proof-verifier/deploy');
    await proofVerifierDeploy(args, env);
  });

task('x-proof-verifier-mock-deploy', 'Deploys ProofVerifierMock')
  .addFlag('dry', 'Perform a dry run (estimate only)')
  .addOptionalParam('nonce', 'Nonce override')
  .setAction(async (args, env) => {
    const { proofVerifierMockDeploy } = await import('./proof-verifier-mock/deploy');
    await proofVerifierMockDeploy(args, env);
  });

task('x-proof-decode', 'Decodes proof bytes')
  .addParam('proof', 'Encoded proof data')
  .setAction(async (args, env) => {
    const { proofDecode } = await import('./proof/decode');
    await proofDecode(args, env);
  });

task('x-test-token-deploy', 'Deploys TestToken')
  .addParam('variant', 'TestToken contract variant')
  .addFlag('dry', 'Perform a dry run (estimate only)')
  .addOptionalParam('nonce', 'Nonce override')
  .setAction(async (args, env) => {
    const { testTokenDeploy } = await import('./test-token/deploy');
    await testTokenDeploy(args, env);
  });

task('x-test-token-mint', 'Mints TestToken')
  .addParam('target', 'TestToken contract address')
  .addParam('account', 'Account address to mint token to')
  .addParam('amount', 'Amount of token to mint')
  .addFlag('dry', 'Perform a dry run (estimate only)')
  .addOptionalParam('nonce', 'Nonce override')
  .setAction(async (args, env) => {
    const { testTokenMint } = await import('./test-token/mint');
    await testTokenMint(args, env);
  });

task('x-light-client-deploy', 'Deploys LightClient')
  .addParam('genesisValidatorsRoot', 'Genesis validators root')
  .addParam('genesisTime', 'Genesis time')
  .addParam('secondsPerSlot', 'Seconds per slot')
  .addParam('slotsPerPeriod', 'Slots per period')
  .addParam('syncCommitteePeriod', 'Sync committee period')
  .addParam('syncCommitteePoseidon', 'Sync committee poseidon')
  .addParam('sourceChainId', 'Source chain ID')
  .addParam('finalityThreshold', 'Finality threshold')
  .setAction(async (args, env) => {
    const { lightClientDeploy } = await import('./light-client/deploy');
    await lightClientDeploy(args, env);
  });

task('x-light-client-step', 'Performs LightClient step')
  .addParam('target', 'LightClient contract to perform step for')
  .addParam('attestedSlot', 'Attested slot')
  .addParam('finalizedSlot', 'Finalized slot')
  .addParam('participation', 'Participation')
  .addParam('finalizedHeaderRoot', 'Finalized header root')
  .addParam('executionStateRoot', 'Execution state root')
  .addParam('stepProofJson', 'Step proof JSON')
  .setAction(async (args, env) => {
    const { lightClientStep } = await import('./light-client/step');
    await lightClientStep(args, env);
  });

task('x-light-client-rotate', 'Performs LightClient rotate')
  .addParam('target', 'LightClient contract to perform rotate for')
  .addParam('attestedSlot', 'Attested slot')
  .addParam('finalizedSlot', 'Finalized slot')
  .addParam('participation', 'Participation')
  .addParam('finalizedHeaderRoot', 'Finalized header root')
  .addParam('executionStateRoot', 'Execution state root')
  .addParam('stepProofJson', 'Step proof JSON')
  .addParam('syncCommitteeSsz', 'Sync committee SSZ')
  .addParam('syncCommitteePoseidon', 'Sync committee poseidon')
  .addParam('rotateProofJson', 'Rotate proof JSON')
  .setAction(async (args, env) => {
    const { lightClientRotate } = await import('./light-client/rotate');
    await lightClientRotate(args, env);
  });
