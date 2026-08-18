import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/app/generated/prisma/enums";
import { hashPassword } from "@/lib/auth/password";

const createStaffSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum([UserRole.admin]),
});

const updateStaffSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

type GetStaffParams = {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
};

function serializeStaff(user: {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function getStaff(params: GetStaffParams = {}) {
  const { page = 1, limit = 10, search, isActive } = params;

  const where = {
    role: {
      not: UserRole.user,
    },
    ...(search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : {}),
    ...(isActive !== undefined
      ? {
          isActive,
        }
      : {}),
  };

  const [staff, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: staff.map(serializeStaff),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getStaffById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    return null;
  }

  return serializeStaff(user);
}

export async function createStaff(input: z.infer<typeof createStaffSchema>) {
  const parsed = createStaffSchema.parse(input);

  const existing = await prisma.user.findUnique({
    where: { email: parsed.email },
  });

  if (existing) {
    throw new Error("Email already registered");
  }

  const passwordHash = await hashPassword(parsed.password);

  const user = await prisma.user.create({
    data: {
      name: parsed.name,
      email: parsed.email,
      phoneNumber: parsed.phoneNumber,
      passwordHash,
      role: parsed.role,
    },
  });

  return serializeStaff(user);
}

export async function updateStaff(id: string, input: z.infer<typeof updateStaffSchema>) {
  const parsed = updateStaffSchema.parse(input);

  const existing = await prisma.user.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Staff not found");
  }

  if (parsed.email) {
    const duplicate = await prisma.user.findUnique({
      where: { email: parsed.email },
    });

    if (duplicate && duplicate.id !== id) {
      throw new Error("Email already registered");
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data: parsed,
  });

  return serializeStaff(user);
}

export async function changeStaffPassword(id: string, newPassword: string) {
  const existing = await prisma.user.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Staff not found");
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id },
    data: { passwordHash },
  });

  return { message: "Password changed successfully" };
}
