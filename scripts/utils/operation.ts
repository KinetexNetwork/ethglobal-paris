import { TransactionRequest } from '@ethersproject/providers';
import { BigNumber, BigNumberish } from 'ethers';
import { Deferrable } from 'ethers/lib/utils';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { getDeployer, calcNextContractAddress } from './deployer';
import {
  formatBalanceDeltaSummary,
  formatBalanceSummary,
  formatGasSummary,
  formatGasUnitsSummary,
  formatHexBytesSize,
  formatOptional,
} from './format';
import { logPropertyGroup, Property } from './property';
import { required } from './required';

const EIP1559_INCOMPATIBLE_CHAINS = new Set([
  'polygon',
  'fantom',
  'arbitrumTest',
]);

export type Transaction = {
  data?: string; // ('run'-like mode only)
  to?: string; // No value => deploy contract ('run'-like mode only)
  result?: unknown; // ('read' mode only)
  value?: BigNumberish
}

export type OperationMode = 'run' | 'dry-run' | 'read';

export type Operation = {
  title: string;
  env: HardhatRuntimeEnvironment;
  mode: OperationMode;
  transaction: () => Promise<Transaction | undefined>;
  nonce?: string;
  gasPrice?: string;
}

export const operation = async (op: Operation): Promise<void> => {
  const deployer = await getDeployer(op.env);
  const txCount = await deployer.getTransactionCount();
  const balanceBefore = await deployer.getBalance();
  const feeData = await deployer.getFeeData();
  const gasPrice = required('gas price', feeData.gasPrice);
  const maxGasPrice = feeData.maxFeePerGas;

  logPropertyGroup({
    title: `Operation "${op.title}" started`,
    properties: [
      { title: 'network', value: op.env.network.name },
      { title: 'mode', value: op.mode },
      { title: 'deployer', value: deployer.address },
      { title: 'tx count', value: txCount.toString() },
      { title: 'balance', value: formatBalanceSummary(balanceBefore) },
      { title: 'next contract address', value: await calcNextContractAddress(deployer) },
      {
        title: 'fee data',
        value: [
          { title: 'last base fee per gas', value: formatOptional(feeData.lastBaseFeePerGas, formatGasSummary) },
          { title: 'max priority fee per gas', value: formatOptional(feeData.maxPriorityFeePerGas, formatGasSummary) },
          { title: 'gas price', value: formatOptional(feeData.gasPrice, formatGasSummary) },
          { title: 'max fee per gas', value: formatOptional(feeData.maxFeePerGas, formatGasSummary) },
        ],
      },
    ],
  });

  const transaction = await op.transaction();

  if (!transaction) {
    logPropertyGroup({
      title: `Operation "${op.title}" finished (no tx data)`,
      properties: [],
    });
    return;
  }

  let transactionRequest: Deferrable<TransactionRequest> | undefined;
  if (op.mode !== 'read') {
    transactionRequest = {
      from: deployer.address,
      to: transaction.to,
      data: transaction.data,
      value: transaction.value
    };

    const eip1559 = !EIP1559_INCOMPATIBLE_CHAINS.has(op.env.network.name);
    if (eip1559) {
      transactionRequest = await deployer.populateTransaction(transactionRequest);
    } else {
      transactionRequest = deployer.checkTransaction(transactionRequest);
    }

    const overrideProps: Property[] = [];
    if (op.nonce != null) {
      overrideProps.push({ title: 'nonce override', value: op.nonce });
      transactionRequest.nonce = Number(op.nonce);
    }

    if (op.gasPrice != null) {
      overrideProps.push({ title: 'gas price override', value: op.gasPrice });
      transactionRequest.gasPrice = op.gasPrice;
    }

    if (overrideProps.length > 0) {
      logPropertyGroup({
        title: `Operation "${op.title}" overrides`,
        properties: overrideProps,
      });
    }
  }

  const extraProps: Property[] = [];

  let resultProp: Property | undefined;
  if (transaction.result != null) {
    resultProp = { title: 'result', value: JSON.stringify(transaction.result) };
    extraProps.push(resultProp);
  }

  let gasUnits = BigNumber.from(0);
  if (op.mode === 'read') {
    logPropertyGroup({
      title: `Operation "${op.title}" read`,
      properties: resultProp != null ? [resultProp] : [],
    });
  } else {
    transactionRequest = required('transaction request', transactionRequest);
    gasUnits = await deployer.estimateGas(transactionRequest);

    const estimatedGasCost = gasUnits.mul(gasPrice);
    const estimatedMaxGasCost = gasUnits.mul(maxGasPrice ?? gasPrice);
    const estimatedBalanceAfter = balanceBefore.sub(estimatedGasCost);
    const estimatedBalanceAfterMax = balanceBefore.sub(estimatedMaxGasCost);

    logPropertyGroup({
      title: `Operation "${op.title}" estimate`,
      properties: [
        { title: 'data size', value: formatHexBytesSize(transaction.data) },
        { title: 'gas units', value: formatGasUnitsSummary(gasUnits) },
        {
          title: 'gas spend',
          value: [
            { title: 'balance before', value: formatBalanceSummary(balanceBefore) },
            { title: 'balance after', value: formatBalanceSummary(estimatedBalanceAfter) },
            { title: 'operation cost', value: formatBalanceDeltaSummary(balanceBefore, estimatedBalanceAfter, { abs: true }) },
          ],
        },
        {
          title: 'max gas spend',
          value: [
            { title: 'balance before', value: formatBalanceSummary(balanceBefore) },
            { title: 'balance after', value: formatBalanceSummary(estimatedBalanceAfterMax) },
            { title: 'operation cost', value: formatBalanceDeltaSummary(balanceBefore, estimatedBalanceAfterMax, { abs: true }) },
          ],
        },
      ],
    });
  }

  if (op.mode === 'run') {
    transactionRequest = required('transaction request', transactionRequest);
    const transactionResponse = await deployer.sendTransaction(transactionRequest);
    const txidProp = { title: 'txid', value: transactionResponse.hash };
    extraProps.push(txidProp);

    logPropertyGroup({
      title: `Operation "${op.title}" waiting for transaction to finish`,
      properties: [
        txidProp,
      ],
    });

    const transactionReceipt = await transactionResponse.wait();

    const contractAddressProp = { title: 'contract address', value: transactionReceipt.contractAddress };
    extraProps.push(contractAddressProp);
    const blockProp = { title: 'block', value: transactionReceipt.blockNumber.toString() };
    extraProps.push(blockProp);

    logPropertyGroup({
      title: `Operation "${op.title}" transaction finished`,
      properties: [
        txidProp,
        blockProp,
        contractAddressProp,
      ],
    });
  }

  const balanceAfter = op.mode === 'run' ? await deployer.getBalance() : balanceBefore;

  logPropertyGroup({
    title: `Operation "${op.title}" finished`,
    properties: [
      { title: 'network', value: op.env.network.name },
      { title: 'mode', value: op.mode },
      { title: 'deployer', value: deployer.address },
      { title: 'balance before', value: formatBalanceSummary(balanceBefore) },
      { title: 'balance after', value: formatBalanceSummary(balanceAfter) },
      { title: 'operation cost', value: formatBalanceDeltaSummary(balanceBefore, balanceAfter, { abs: true }) },
      { title: 'gas units', value: formatGasUnitsSummary(gasUnits) },
      ...extraProps,
    ],
  });
}
