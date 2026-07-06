import { prisma } from "../../lib/prisma";
import ApiError from "../../utils/ApiError";

interface TechnicianFilters {
  location?: string;
  minRating?: string;
  search?: string;
  page?: string;
  limit?: string;
}

const getAllTechnicians = async (filters: TechnicianFilters) => {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (filters.location) where.location = { contains: filters.location, mode: "insensitive" };
  if (filters.minRating) where.avgRating = { gte: Number(filters.minRating) };
  if (filters.search) {
    where.user = { name: { contains: filters.search, mode: "insensitive" } };
  }

  const [technicians, total] = await Promise.all([
    prisma.technicianProfile.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        services: true,
      },
      orderBy: { avgRating: "desc" },
    }),
    prisma.technicianProfile.count({ where }),
  ]);

  return { technicians, meta: { page, limit, total } };
};

const getTechnicianById = async (id: string) => {
  const technician = await prisma.technicianProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      services: true,
      availability: true,
      reviews: {
        include: { customer: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!technician) throw new ApiError(404, "Technician not found");
  return technician;
};

const updateProfile = async (
  userId: string,
  payload: { bio?: string; experience?: number; location?: string }
) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) throw new ApiError(404, "Technician profile not found");

  return prisma.technicianProfile.update({ where: { userId }, data: payload });
};

const updateAvailability = async (
  userId: string,
  slots: { dayOfWeek: number; startTime: string; endTime: string; isAvailable?: boolean }[]
) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) throw new ApiError(404, "Technician profile not found");

  // Replace all existing slots with the new set (simple full-replace strategy)
  await prisma.availability.deleteMany({ where: { technicianId: profile.id } });

  await prisma.availability.createMany({
    data: slots.map((slot) => ({ ...slot, technicianId: profile.id })),
  });

  return prisma.availability.findMany({ where: { technicianId: profile.id } });
};

const getMyBookings = async (userId: string, status?: string) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) throw new ApiError(404, "Technician profile not found");

  const where: any = { technicianId: profile.id };
  if (status) where.status = status;

  return prisma.booking.findMany({
    where,
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true } },
      service: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

const updateBookingStatus = async (
  userId: string,
  bookingId: string,
  status: "ACCEPTED" | "DECLINED" | "IN_PROGRESS" | "COMPLETED"
) => {
  const profile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!profile) throw new ApiError(404, "Technician profile not found");

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new ApiError(404, "Booking not found");
  if (booking.technicianId !== profile.id) {
    throw new ApiError(403, "You can only manage your own bookings");
  }

  const validTransitions: Record<string, string[]> = {
    REQUESTED: ["ACCEPTED", "DECLINED"],
    PAID: ["IN_PROGRESS"],
    IN_PROGRESS: ["COMPLETED"],
  };

  const allowedNext = validTransitions[booking.status] || [];
  if (!allowedNext.includes(status)) {
    throw new ApiError(
      400,
      `Cannot change booking status from ${booking.status} to ${status}`
    );
  }

  return prisma.booking.update({ where: { id: bookingId }, data: { status } });
};

export const technicianService = {
  getAllTechnicians,
  getTechnicianById,
  updateProfile,
  updateAvailability,
  getMyBookings,
  updateBookingStatus,
};
