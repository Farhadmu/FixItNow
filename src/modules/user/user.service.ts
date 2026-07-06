import { prisma } from "../../lib/prisma";
import ApiError from "../../utils/ApiError";

const getAllUsers = async (filters: { role?: string; status?: string; page?: string; limit?: string }) => {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (filters.role) where.role = filters.role;
  if (filters.status) where.status = filters.status;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true, name: true, email: true, phone: true, role: true, status: true, createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, meta: { page, limit, total } };
};

const updateUserStatus = async (userId: string, status: "ACTIVE" | "BANNED") => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, "User not found");
  if (user.role === "ADMIN") throw new ApiError(400, "Cannot change status of an admin account");

  return prisma.user.update({
    where: { id: userId },
    data: { status },
    select: { id: true, name: true, email: true, role: true, status: true },
  });
};

const getAllBookingsForAdmin = async (filters: { status?: string; page?: string; limit?: string }) => {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (filters.status) where.status = filters.status;

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take: limit,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        technician: { include: { user: { select: { id: true, name: true, email: true } } } },
        service: true,
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.count({ where }),
  ]);

  return { bookings, meta: { page, limit, total } };
};

export const userService = { getAllUsers, updateUserStatus, getAllBookingsForAdmin };
