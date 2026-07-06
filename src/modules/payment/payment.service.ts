import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import ApiError from "../../utils/ApiError";
import { env } from "../../config/env";

// Create a Stripe Checkout Session for a booking that has already been ACCEPTED
// by the technician. Only the booking's owner (customer) may pay for it.
const createPayment = async (customerId: string, bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { service: true, payment: true },
  });

  if (!booking) throw new ApiError(404, "Booking not found");
  if (booking.customerId !== customerId) {
    throw new ApiError(403, "You can only pay for your own bookings");
  }
  if (booking.status !== "ACCEPTED") {
    throw new ApiError(400, "Payment can only be made for ACCEPTED bookings");
  }
  if (booking.payment) {
    throw new ApiError(409, "A payment already exists for this booking");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: booking.service.title },
          unit_amount: Math.round(booking.totalAmount * 100),
        },
        quantity: 1,
      },
    ],
    metadata: { bookingId: booking.id, customerId },
    success_url: `${env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.CLIENT_URL}/payment/cancel`,
  });

  const payment = await prisma.payment.create({
    data: {
      bookingId: booking.id,
      userId: customerId,
      transactionId: session.id,
      amount: booking.totalAmount,
      provider: "STRIPE",
      status: "PENDING",
      providerSessionId: session.id,
    },
  });

  return { payment, checkoutUrl: session.url, sessionId: session.id };
};

// Confirms a payment by re-checking the Checkout Session status with Stripe.
// Called either manually (Postman) or via the Stripe webhook handler.
const confirmPayment = async (sessionId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  const payment = await prisma.payment.findUnique({ where: { transactionId: sessionId } });
  if (!payment) throw new ApiError(404, "Payment record not found for this session");

  if (session.payment_status !== "paid") {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    throw new ApiError(400, `Payment not completed. Stripe status: ${session.payment_status}`);
  }

  const updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "COMPLETED",
      method: session.payment_method_types?.[0] || "card",
      paidAt: new Date(),
    },
  });

  await prisma.booking.update({ where: { id: payment.bookingId }, data: { status: "PAID" } });

  return updatedPayment;
};

// Used by the Stripe webhook (checkout.session.completed event)
const confirmPaymentByWebhook = async (sessionId: string) => {
  const payment = await prisma.payment.findUnique({ where: { transactionId: sessionId } });
  if (!payment) return null;

  const updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "COMPLETED", paidAt: new Date() },
  });

  await prisma.booking.update({ where: { id: payment.bookingId }, data: { status: "PAID" } });
  return updatedPayment;
};

const getMyPayments = async (userId: string) => {
  return prisma.payment.findMany({
    where: { userId },
    include: { booking: { include: { service: true } } },
    orderBy: { createdAt: "desc" },
  });
};

const getPaymentById = async (userId: string, role: string, paymentId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { booking: { include: { service: true } } },
  });

  if (!payment) throw new ApiError(404, "Payment not found");
  if (role !== "ADMIN" && payment.userId !== userId) {
    throw new ApiError(403, "You do not have access to this payment");
  }

  return payment;
};

export const paymentService = {
  createPayment,
  confirmPayment,
  confirmPaymentByWebhook,
  getMyPayments,
  getPaymentById,
};
