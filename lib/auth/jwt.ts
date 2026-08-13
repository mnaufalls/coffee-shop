import jwt, { type JwtPayload } from "jsonwebtoken";

export type UserRole = "super_admin" | "admin" | "user";

export type AccessTokenPayload = {
  userId: string;
  role: UserRole;
};

function getAccessSecret(): string {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not configured");
  }

  return secret;
}

function getRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not configured");
  }

  return secret;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, getAccessSecret(), {
    expiresIn: "15m",
  });
}

export function signRefreshToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, getRefreshSecret(), {
    expiresIn: "7d",
  });
}

function parsePayload(decoded: string | JwtPayload): AccessTokenPayload {
  if (
    typeof decoded === "string" ||
    typeof decoded.userId !== "string" ||
    !["super_admin", "admin", "user"].includes(String(decoded.role))
  ) {
    throw new Error("Invalid token payload");
  }

  return {
    userId: decoded.userId,
    role: decoded.role as UserRole,
  };
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, getAccessSecret());

  return parsePayload(decoded);
}

export function verifyRefreshToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, getRefreshSecret());

  return parsePayload(decoded);
}