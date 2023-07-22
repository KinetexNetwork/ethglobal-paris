import { BigNumber, BigNumberish } from 'ethers';

export const addPercent = (to: BigNumberish, percent: BigNumberish): BigNumber => {
  const multiplier = BigNumber.from(percent).add('100');
  const result = BigNumber.from(to).mul(multiplier).div('100');
  return result;
};

export const formatPrice = (value: BigNumberish, decimals: number): string => {
  const dividend = BigNumber.from(value).mul(100);
  const divisor = BigNumber.from(10).pow(decimals);
  const price = dividend.div(divisor).toNumber() / 100;
  return `$${price.toFixed(2)}`;
}
