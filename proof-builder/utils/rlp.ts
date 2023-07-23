export const handleRLPNumber = (number: string) => {
    const n = `0x${BigInt(number).toString(16)}`;
    return n == `0x0` ? `0x` : n;
};
