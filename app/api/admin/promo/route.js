import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { code, discount, users } = body || {};

    if (!code || !discount) {
      return NextResponse.json(
        { error: "Code and discount are required." },
        { status: 400 }
      );
    }

    if (Number.isNaN(Number(discount)) || discount <= 0 || discount > 90) {
      return NextResponse.json(
        { error: "Discount must be between 1 and 90." },
        { status: 400 }
      );
    }

    const upperCode = code.trim().toUpperCase();

    // Check if promo already exists
    const existing = await prisma.promo.findUnique({
      where: { code: upperCode },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Promo code already exists." },
        { status: 409 }
      );
    }

    // Create and save promo
    const promo = await prisma.promo.create({
      data: {
        code: upperCode,
        discount: Number(discount),
        allowedUsers: Array.isArray(users) ? users.filter(Boolean) : [],
      },
    });

    return NextResponse.json({
      success: true,
      message: `Promo ${upperCode} created successfully.`,
      promo,
    });
  } catch (err) {
    console.error("/api/admin/promo POST error", err);
    return NextResponse.json(
      { error: "Unable to process promo right now." },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const promos = await prisma.promo.findMany({ where: { isActive: true } });
    return NextResponse.json({
      success: true,
      promos: promos.map((p) => ({
        code: p.code,
        discount: p.discount,
      })),
    });
  } catch (err) {
    console.error("/api/admin/promo GET error", err);
    return NextResponse.json(
      { error: "Unable to fetch promos." },
      { status: 500 }
    );
  }
}
