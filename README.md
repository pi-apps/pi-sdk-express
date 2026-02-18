# Pi SDK Express

An Express SDK for processing Pi Network payments.

## Installation

```bash
npm install pi-sdk-express
# or
yarn add pi-sdk-express
```

## Quick Start

```typescript
import express from 'express';
import { createPiPaymentRouter } from 'pi-sdk-express';

const app = express();
app.use(express.json());
app.use('/pi_payment', createPiPaymentRouter());

app.listen(3000);
```

## Environment Variables

Set `PI_API_KEY` in your environment:

```bash
export PI_API_KEY="your-api-key"
```

## Documentation

See [README.md](./README.md) for full documentation.
