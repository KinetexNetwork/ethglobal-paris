import '@chainsafe/persistent-merkle-tree';

/*
 * This needs to be fixed
 */
declare module '@chainsafe/persistent-merkle-tree' {
    export interface TreeOffsetProof {
        witnesses: any[];
    }
}
