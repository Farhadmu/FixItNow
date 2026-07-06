import { prisma } from "../../lib/prisma";
import ApiError from "../../utils/ApiError";

const createBooking = async (
  customerId: string,
  payload: { serviceId: string; scheduledAt: string; address?: string }
) => {
  const service = await prisma.service.findUnique({ where: { id: payload.serviceId } });
  if (!service || !service.isActive) throw new ApiError(404, "Service not found or inactive");

  return prisma.booking.create({
    data: {
      customerId,
      technicianId: service.technicianId,
      serviceId: service.id,
      scheduledAt: new Date(payload.scheduledAt),
      address: payload.address,
      totalAmount: service.price,
      status: "REQUESTED",
    },
    include: { service: true },
  });
};

const getMyBookings = async (customerId: string, status?: string) => {
  const where: any = { customerId };
  if (status) where.status = status;

  return prisma.booking.findMany({
    where,
    include: {
      service: { include: { category: true } },
      technician: { include: { user: { select: { id: true, name: true, email: true } } } },
      payment: true,
      review: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

const getBookingById = async (userId: string, role: string, bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: { include: { category: true } },
      technician: { include: { user: { select: { id: true, name: true, email: true } } } },
      customer: { select: { id: true, name: true, email: true, phone: true } },
      payment: true,
      review: true,
    },
  });

  if (!booking) throw new ApiError(404, "Booking not found");

  if (role === "ADMIN") return booking;

  const technicianProfile = await prisma.technicianProfile.findUnique({ where: { userId } });
  const isOwner =
    booking.customerId === userId || (technicianProfile && booking.technicianId === technicianProfile.id);

  if (!isOwner) throw new ApiError(403, "You do not have access to this booking");

  return booking;
};

const cancelBooking = async (customerId: string, bookingId: string) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new ApiError(404, "Booking not found");
  if (booking.customerId !== customerId) throw new ApiError(403, "You can only cancel your own bookings");

  if (["IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(booking.status)) {
    throw new ApiError(400, `Booking cannot be cancelled once it is ${booking.status}`);
  }

  return prisma.booking.update({ where: { id: bookingId }, data: { status: "CANCELLED" } });
};

export const bookingService = { createBooking, getMyBookings, getBookingById, cancelBooking };
