import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { MenuItem } from "@/models/MenuItem";
import { verifyAuthFromRequest } from "@/lib/auth";
import { serializeDoc } from "@/lib/serialize";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid menu item ID" }, { status: 400 });
    }

    const authUser = await verifyAuthFromRequest(request);
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin required" }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    await connectDB();

    const menuItem = await MenuItem.findById(id);
    if (!menuItem) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    const {
      name,
      description,
      price,
      category,
      isVeg,
      image,
      isAvailable,
    } = body as {
      name?: unknown;
      description?: unknown;
      price?: unknown;
      category?: unknown;
      isVeg?: unknown;
      image?: unknown;
      isAvailable?: unknown;
    };

    if (typeof name === "string" && name.trim().length > 0) {
      menuItem.name = name.trim();
    }
    if (typeof description === "string") {
      menuItem.description = description.trim();
    }
    if (
      typeof price === "number" &&
      Number.isInteger(price) &&
      price >= 0
    ) {
      menuItem.price = price;
    }
    if (typeof category === "string" && category.trim().length > 0) {
      menuItem.category = category.trim();
    }
    if (typeof isVeg === "boolean") {
      menuItem.isVeg = isVeg;
    }
    if (typeof image === "string" && image.trim().length > 0) {
      menuItem.image = image.trim();
    }
    if (typeof isAvailable === "boolean") {
      menuItem.isAvailable = isAvailable;
    }

    await menuItem.save();

    return NextResponse.json({ menuItem: serializeDoc(menuItem) }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid menu item ID" }, { status: 400 });
    }

    const authUser = await verifyAuthFromRequest(request);
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin required" }, { status: 403 });
    }

    await connectDB();

    const menuItem = await MenuItem.findByIdAndDelete(id);
    if (!menuItem) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Menu item deleted successfully" },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
