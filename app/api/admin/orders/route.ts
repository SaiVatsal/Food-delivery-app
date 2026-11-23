import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { verifyAuthFromRequest } from "@/lib/auth";
import { serializeDocs } from "@/lib/serialize";

export async function GET(request: Request) {
  try {
    const authUser = await verifyAuthFromRequest(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (authUser.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const orders = await Order.find({})
      .populate("restaurantId", "name image location slug")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        orders: serializeDocs(orders),
        serverNow: Date.now(),
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
