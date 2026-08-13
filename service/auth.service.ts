import { prisma } from "@/lib/prisma";
import { UserRole } from "@/app/generated/prisma/enums";

import {
  comparePassword,
  hashPassword,
} from "@/lib/auth/password";

import {
  signAccessToken,
  signRefreshToken,
} from "@/lib/auth/jwt";


type RegisterInput = {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

export async function registerUser(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      phoneNumber: input.phoneNumber,
      passwordHash,
      role: UserRole.user,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordValid = await comparePassword(
    input.password,
    user.passwordHash,
  );

  if (!passwordValid) {
    throw new Error("Invalid email or password");
  }

  const payload = {
    userId: user.id,
    role: user.role,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
}