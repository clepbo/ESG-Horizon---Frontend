"use client";

import { jwtVerify } from "jose";

export async function verifyToken(token: string, secret: string) {
  try {
    const encoder = new TextEncoder();
    const { payload } = await jwtVerify(token, encoder.encode(secret));
    return payload;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
}
