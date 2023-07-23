import { utils } from 'ethers';

export const unpack2Bytes64Values = (packed: string) =>
    utils.defaultAbiCoder.decode(['uint64', 'uint64'], packed);

export const unpack2Bytes32Values = (packed: string) =>
    utils.defaultAbiCoder.decode(['uint32', 'uint32'], packed);
