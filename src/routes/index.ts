import express from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { categoryRoutes } from "../modules/category/category.routes";
import { serviceRoutes } from "../modules/service/service.routes";
import { technicianRoutes } from "../modules/technician/technician.routes";
import { bookingRoutes } from "../modules/booking/booking.routes";
import { paymentRoutes } from "../modules/payment/payment.routes";
import { reviewRoutes } from "../modules/review/review.routes";
import { adminRoutes } from "../modules/user/user.routes";

const router = express.Router();

const moduleRoutes = [
  { path: "/auth", route: authRoutes },
  { path: "/categories", route: categoryRoutes },
  { path: "/services", route: serviceRoutes },
  { path: "/technicians", route: technicianRoutes },
  // /api/technician/* aliases to match the assignment spec naming exactly
  { path: "/technician", route: technicianRoutes },
  { path: "/bookings", route: bookingRoutes },
  { path: "/payments", route: paymentRoutes },
  { path: "/reviews", route: reviewRoutes },
  { path: "/admin", route: adminRoutes },
];

moduleRoutes.forEach((r) => router.use(r.path, r.route));

export default router;
