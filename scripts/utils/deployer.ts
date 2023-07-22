import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import rlp from "rlp";
import keccak from "keccak";

export const getDeployer = async (env: HardhatRuntimeEnvironment): Promise<SignerWithAddress> => {
  const [deployer] = await env.ethers.getSigners();
  return deployer;
};

export const calcNextContractAddress = async (deployer: SignerWithAddress) => {
  const nonce = await deployer.getTransactionCount();
  const sender = await deployer.getAddress();
  const rlpEncoded = Buffer.from( rlp.encode([sender, nonce]) );
  return '0x' + keccak("keccak256").update(rlpEncoded).digest("hex").substring(24);
}