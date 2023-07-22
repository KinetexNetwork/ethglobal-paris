import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, BytesLike } from 'ethers';

const ETH_DECIMALS = 18;
const GWEI_DECIMALS = 9;

const toDecimalParts = (wei: BigNumber, baseDecimals: number, toDecimals: number): [BigNumber, BigNumber, number] => {
  const integerDenominator = BigNumber.from(10).pow(baseDecimals);
  const integer = wei.div(integerDenominator);

  const fractionDenominator = BigNumber.from(10).pow(baseDecimals - toDecimals);
  const fractionSubtrahend = BigNumber.from(10).pow(toDecimals).mul(integer);
  const fraction = wei.div(fractionDenominator).sub(fractionSubtrahend);
  const fractionZeros = toDecimals - fraction.toString().length;

  return [integer, fraction, fractionZeros];
};

const toDecimal = (wei: BigNumber, baseDecimals: number, toDecimals: number): string => {
  const [integer, fraction, fractionZeros] = toDecimalParts(wei.abs(), baseDecimals, toDecimals);
  const fractionPrefix = '0'.repeat(fractionZeros);
  const decimalStr = `${wei.lt(0) ? '-' : ''}${integer.toString()}.${fractionPrefix}${fraction.toString()}`;
  return decimalStr;
};

export const formatEthString = (wei: BigNumber, decimals: number): string => {
  const decimalStr = toDecimal(wei, ETH_DECIMALS, decimals);
  const str = `${decimalStr} ETH`;
  return str;
};

const formatWeiString = (wei: BigNumber): string => {
  const str = `${wei.toString()} WEI`;
  return str;
};

const formatGweiString = (wei: BigNumber, decimals: number): string => {
  const decimalStr = toDecimal(wei, GWEI_DECIMALS, decimals);
  const str = `${decimalStr} GWEI`;
  return str;
};

export const formatBalanceSummary = (balance: BigNumber): string => {
  const summary = `~${formatEthString(balance, 6)} (${formatWeiString(balance)})`;
  return summary;
};

export const getBalanceSummary = async (address: SignerWithAddress): Promise<string> => {
  const balance = await address.getBalance();
  const summary = formatBalanceSummary(balance);
  return summary;
};

interface FormatBalanceDeltaSummaryOptions {
  abs?: boolean;
}

export const formatBalanceDeltaSummary = (
  balanceBefore: BigNumber,
  balanceAfter: BigNumber,
  options: FormatBalanceDeltaSummaryOptions = {},
): string => {
  const { abs = false } = options;

  const balanceDelta = balanceAfter.sub(balanceBefore);
  let summary = formatBalanceSummary(balanceDelta.abs());
  if (abs) {
    return summary;
  }

  if (balanceDelta.gt(0)) {
    summary = `+ ${summary}`;
  } else if (balanceDelta.lt(0)) {
    summary = `- ${summary}`;
  }
  return summary;
};

export const formatGasSummary = (gasPrice: BigNumber): string => {
  const summary = `~${formatGweiString(gasPrice, 6)} (${formatWeiString(gasPrice)})`;
  return summary;
};

export const formatGasUnitsSummary = (gasUnits: BigNumber): string => {
  const summary = gasUnits.toString();
  return summary;
};

export const formatHexBytesSize = (data?: BytesLike): string => {
  let bytes: number;
  if (data == null) {
    // Nothing
    bytes = 0;
  } else if (typeof data === 'string') {
    // Hex string
    let hexLength = data.length;
    if (data.startsWith('0x')) {
      hexLength -= 2;
    }
    bytes = Math.ceil(hexLength / 2);
  } else {
    // Byte array
    bytes = data.length;
  }

  const str = `${bytes} bytes`;
  return str;
};

export const formatBoolean = (value: boolean): string => {
  return value ? 'true' : 'false';
};

/**
 * Every block printed should leave spacing after itself.
 * This function adds spacing before any other output
 */
export const beginTask = (): void => {
  console.log();
};

type Optional<T> = T | null | undefined;

export const formatOptional = <T>(value: Optional<T>, formatter: (value: T) => string): string => {
  if (value == null) {
    return '<nullish>';
  }
  return formatter(value);
}
