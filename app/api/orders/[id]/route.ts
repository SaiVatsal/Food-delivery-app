import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Order, IOrder } from "@/models/Order";
import { verifyAuthFromRequest } from "@/lib/auth";
import { serializeDoc } from "@/lib/serialize";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid order ID format" },
        { status: 400 }
      );
    }

    const authUser = await verifyAuthFromRequest(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const order = await Order.findById(id).populate(
      "restaurantId",
      "name image location coordinates slug"
    );

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Authorization: User can only view their own order, Admin can view any
    if (
      order.userId.toString() !== authUser.id &&
      authUser.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to view this order" },
        { status: 403 }
      );
    }

    const serverNow = Date.now();

    // Lazy simulation when SIMULATE_DELIVERY is "true"
    const simulateDelivery = process.env.SIMULATE_DELIVERY === "true";
    if (
      simulateDelivery &&
      order.status !== "Cancelled" &&
      order.status !== "Delivered" &&
      order.createdAt
    ) {
      const elapsedSeconds = (serverNow - new Date(order.createdAt).getTime()) / 1000;
      let newStatus: IOrder["status"] = order.status;
      let newOutForDeliveryAt = order.outForDeliveryAt;

      if (elapsedSeconds < 20) {
        newStatus = "Placed";
      } else if (elapsedSeconds < 60) {
        newStatus = "Preparing";
      } else {
        // >= 60 seconds
        if (!newOutForDeliveryAt) {
          newOutForDeliveryAt = new Date(
            new Date(order.createdAt).getTime() + 60_000
          );
        }

        const outDeliveryElapsed =
          (serverNow - new Date(newOutForDeliveryAt).getTime()) / 1000;
        const eta = Math.max(90, order.etaSeconds || 120);

        if (outDeliveryElapsed / eta >= 1) {
          newStatus = "Delivered";
        } else {
          newStatus = "Out for Delivery";
        }
      }

      if (
        newStatus !== order.status ||
        newOutForDeliveryAt !== order.outForDeliveryAt
      ) {
        order.status = newStatus;
        if (newOutForDeliveryAt) {
          order.outForDeliveryAt = newOutForDeliveryAt;
        }
        await order.save();
      }
    }

    return NextResponse.json(
      {
        order: serializeDoc(order),
        serverNow,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid order ID format" },
        { status: 400 }
      );
    }

    const authUser = await verifyAuthFromRequest(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId.toString() !== authUser.id) {
      return NextResponse.json(
        { error: "Forbidden: You cannot cancel another user's order" },
        { status: 403 }
      );
    }

    if (order.status !== "Placed") {
      return NextResponse.json(
        {
          error: `Cannot cancel order in "${order.status}" status. Orders can only be cancelled while in "Placed" status.`,
        },
        { status: 400 }
      );
    }

    order.status = "Cancelled";
    await order.save();

    return NextResponse.json({ order: serializeDoc(order) }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
