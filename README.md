## Kinetex MMR LightClient
### Built on ETHGlobal Paris Hackathon

Kinetex on-chain light clients are designed to be deployed on any EVM network and to be capable of storing the state of supported networks. In its fundamental form, the applied approach utilizes the `blockhash` function to obtain one of the last 256 blocks. Subsequently, the cross-chain messaging protocols are used to transfer this block hash to networks where instances of light clients are deployed.

Our solution is built upon Hashi adapters, which we have specifically developed for various cross-chain messaging protocols such as Chainlink CCIP, Axelar, Hyperlane, and Zetachain. This allows us to support light clients for numerous networks, including Ethereum, Gnosis, Polygon, Linea, Celo, and others.

Notably, every block hash is not transmitted individually. Instead, the BlockReporter contract is executed every 1024 blocks, creating checkpoints. Based on these checkpoints, Merkle-trees of block hash batches are constructed and stored in the appendable Merkle Mountain Range for enhanced efficiency. This approach draws inspiration from the Axiom project's idea.

The project includes several components, including an MMR LightClient implementation, Hashi adapter contracts for cross-chain messaging protocols, a BlockReporter managing contract, and an Event Logs proofer implementation that can be utilized in the Kinetex Protocol or other projects.

Moreover, the project includes functionalities for generating proofs and raw data of block headers. Additionally, we have developed sketches for the zk-circuits related to block batching.

To ease the deployment and management of contract calls, the helper scripts are included.