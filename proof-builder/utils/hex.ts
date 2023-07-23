import { ProofType } from '@chainsafe/persistent-merkle-tree';

export const hexValue = (value: any) =>
    `0x${Buffer.from(value).toString('hex')}`;

export const logProof = (proof: any, proofType: ProofType) => {
    switch (proofType) {
        case ProofType.single:
            console.log(proof.witnesses.map((el: any) => hexValue(el)));
            break;

        case ProofType.treeOffset:
            console.log(proof.leaves.map((el: any) => hexValue(el)));
            break;

        default:
            console.log('unsupported proofType');
    }
};

export const buffArrToHex = (arr: Array<any>): string[] =>
    arr.map((el: any) => (typeof el === 'string' ? el : hexValue(el)));

export const ensureLeading0x = (input: string) =>
    input.startsWith('0x') ? input : `0x${input}`;
