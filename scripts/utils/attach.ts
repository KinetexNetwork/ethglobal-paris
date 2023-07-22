import { Contract } from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { logPropertyGroup } from './property';

type ContractName = string;
type ContractAddress = string;

type AttachContractParams = {
  contractName: ContractName,
  contractAddress: ContractAddress,
  env: HardhatRuntimeEnvironment,
};

export const attachContract = async <AttachedContract extends Contract>(
  params: AttachContractParams,
): Promise<AttachedContract> => {
  const { contractName, contractAddress, env } = params;

  logPropertyGroup({
    title: 'Attaching to existing contract',
    properties: [
      { title: 'contract', value: contractName },
      { title: 'address', value: contractAddress },
    ]
  });

  const contract = await env.ethers.getContractAt(params.contractName, contractAddress);
  return contract as AttachedContract;
};
