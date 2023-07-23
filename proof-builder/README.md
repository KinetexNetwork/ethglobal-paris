## Transaction Fetcher & Prover

Configure:

```bash
cp .env.example -> .env
yarn
mkdir output
export NODE_OPTIONS=--max-old-space-size=4096
```

Run codegen:

```bash
yarn codegen
```

### Execution Client Mode

Fetch block data for execution layer:

```bash
yarn fetch --network [network] --block [block]
```

```bash
yarn prove --network [network] --tx 0x01 --block [block]
```
