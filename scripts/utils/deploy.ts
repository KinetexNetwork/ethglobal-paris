import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { formatHexBytesSize } from '../utils/format';
import { logPropertyGroup } from './property';
import { required } from './required';

type ContractName = string;
type ConstructorParamsBase = any[];

export type DeployContractParams<ConstructorParams extends ConstructorParamsBase> = {
  contractName: ContractName,
  fullContractName?: ContractName,
  constructorParams: ConstructorParams,
  env: HardhatRuntimeEnvironment,
};

export const getDeployContractData = async <CP extends ConstructorParamsBase>(
  params: DeployContractParams<CP>,
): Promise<string> => {
  const contractName = params.fullContractName ?? params.contractName;

  const contractFactory = await params.env.ethers.getContractFactory(params.fullContractName ?? params.contractName);
  const deployTransaction = contractFactory.getDeployTransaction(...params.constructorParams);
  const deployData = required('deploy transaction data', deployTransaction.data).toString();

  logPropertyGroup({
    title: 'Prepare deploy contract data',
    properties: [
      { title: 'contract name', value: contractName },
      { title: 'constructor params', value: JSON.stringify(params.constructorParams) },
      { title: 'deploy data size', value: formatHexBytesSize(deployData) },
    ],
  });

  return deployData;
};
