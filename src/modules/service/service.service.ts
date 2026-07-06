import { prisma } from "../../lib/prisma";
import ApiError from "../../utils/ApiError";

interface ServiceFilters {
  categoryId?: string;
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string;
  page?: string;
  limit?: string;
}

const getAllServices = async (filters: ServiceFilters) => {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = { isActive: true };

  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.location) where.location = { contains: filters.location, mode: "insensitive" };
  if (filters.search) where.title = { contains: filters.search, mode: "insensitive" };
  if (filters.minPrice || filters.maxPrice) {
    where.price = {};
    if (filters.minPrice) where.price.gte = Number(filters.minPrice);
    if (filters.maxPrice) where.price.lte = Number(filters.maxPrice);
  }

  const [services, total] = await Promise.all([
    prisma.service.findMany({
      where,
      skip,
      take: limit,
      include: {
        category: true,
        technician: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.service.count({ where }),
  ]);

  return { services, meta: { page, limit, total } };
};

const getServiceById = async (id: string) => {
  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      category: true,
      technician: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });

  if (!service) throw new ApiError(404, "Service not found");
  return service;
};

const createService = async (
  userId: string,
  payload: { title: string; description?: string; price: number; categoryId: string; location?: string }
) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!technicianProfile) throw new ApiError(404, "Technician profile not found. Complete your profile first.");

  const category = await prisma.category.findUnique({ where: { id: payload.categoryId } });
  if (!category) throw new ApiError(404, "Category not found");

  return prisma.service.create({
    data: { ...payload, technicianId: technicianProfile.id },
  });
};

const updateService = async (userId: string, serviceId: string, payload: any) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!technicianProfile) throw new ApiError(404, "Technician profile not found");

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) throw new ApiError(404, "Service not found");
  if (service.technicianId !== technicianProfile.id) {
    throw new ApiError(403, "You can only update your own services");
  }

  return prisma.service.update({ where: { id: serviceId }, data: payload });
};

const deleteService = async (userId: string, serviceId: string) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({ where: { userId } });
  if (!technicianProfile) throw new ApiError(404, "Technician profile not found");

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) throw new ApiError(404, "Service not found");
  if (service.technicianId !== technicianProfile.id) {
    throw new ApiError(403, "You can only delete your own services");
  }

  return prisma.service.delete({ where: { id: serviceId } });
};

export const serviceService = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
