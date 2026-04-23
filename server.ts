import express from "express";
import { createServer as createViteServer } from "vite";
import { SquareClient, SquareEnvironment } from "square";
import crypto from "crypto";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();
// `process.env.PORT` is `string | undefined`; ensure we pass a `number` to `app.listen`.
const PORT = Number(process.env.PORT ?? 3001) || 3001;

app.use(express.json());

// Square Client Initialization (Lazy)
let squareClient: SquareClient | null = null;
function getSquareClient() {
  if (!squareClient) {
    const accessToken = process.env.SQUARE_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error("SQUARE_ACCESS_TOKEN environment variable is required");
    }
    squareClient = new SquareClient({
      environment: process.env.SQUARE_ENVIRONMENT === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
      token: accessToken,
    });
  }
  return squareClient;
}

// Payment API Route
app.post("/api/payment", async (req, res) => {
  try {
    const { sourceId, amount } = req.body;
    const client = getSquareClient();
    
    const response = await client.payments.create({
      sourceId,
      idempotencyKey: crypto.randomUUID(),
      amountMoney: {
        amount: BigInt(Math.round(amount * 100)), // amount in cents
        currency: 'USD',
      },
    });
    
    // Convert BigInt to string before JSON serialization
    const paymentResult = JSON.parse(
      JSON.stringify(response.payment, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );

    res.json({ success: true, payment: paymentResult });
  } catch (error: any) {
    console.error("Payment failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
