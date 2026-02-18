import express from 'express';
import { createPiPaymentRouter } from 'pi-sdk-express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());

// Serve static files
app.use(express.static(join(__dirname, 'public')));

// // Serve js SDK (for frontend)
app.use(
    '/sdk',
    express.static(
        join(__dirname, 'node_modules/pi-sdk-js/dist'),
        {
            setHeaders(res, path) {
                if (path.endsWith('.js')) {
                    res.setHeader('Content-Type', 'application/javascript');
                }
            }
        }
    )
);

// Mount Pi payment routes
app.use('/pi_payment', createPiPaymentRouter());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
