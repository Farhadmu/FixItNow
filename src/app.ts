import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes";
import errorMiddleware from "./middlewares/error.middleware";
import notFoundMiddleware from "./middlewares/notFound.middleware";
import { paymentController } from "./modules/payment/payment.controller";

const app: Application = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Stripe webhook needs the RAW body (not JSON parsed) to verify the signature,
// so it must be registered before express.json().
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleWebhook
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "FixItNow API is running 🔧",
    docs: "/api",
  });
});

app.get("/api", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Welcome to the FixItNow API",
    version: "1.0.0",
  });
});

app.use("/api", routes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
