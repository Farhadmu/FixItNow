import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { paymentService } from "./payment.service";
import ApiError from "../../utils/ApiError";
import { stripe } from "../../lib/stripe";
import { env } from "../../config/env";

const createPayment = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authorized");
  const result = await paymentService.createPayment(req.user.id, req.body.bookingId);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Payment session created. Redirect the customer to checkoutUrl to pay.",
    data: result,
  });
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.confirmPayment(req.body.sessionId);
  sendResponse(res, { statusCode: 200, success: true, message: "Payment confirmed successfully", data: result });
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authorized");
  const result = await paymentService.getMyPayments(req.user.id);
  sendResponse(res, { statusCode: 200, success: true, message: "Payment history retrieved successfully", data: result });
});

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authorized");
  const result = await paymentService.getPaymentById(req.user.id, req.user.role, req.params.id);
  sendResponse(res, { statusCode: 200, success: true, message: "Payment details retrieved successfully", data: result });
});

// Stripe webhook - listens for checkout.session.completed
const handleWebhook = catchAsync(async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    return res.status(400).json({ success: false, message: `Webhook Error: ${err.message}`, errorDetails: err.message });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    await paymentService.confirmPaymentByWebhook(session.id);
  }

  res.json({ received: true });
});

export const paymentController = {
  createPayment,
  confirmPayment,
  getMyPayments,
  getPaymentById,
  handleWebhook,
};
