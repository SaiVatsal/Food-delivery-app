import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Restaurant } from "@/models/Restaurant";
import { MenuItem } from "@/models/MenuItem";
import { isValidCoordinates } from "@/lib/geo";
import { verifyAuthFromRequest } from "@/lib/auth";
import { serializeDoc } from "@/lib/serialize";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid restaurant ID" }, { status: 400 });
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

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    const {
      name,
      cuisine,
      image,
      rating,
      deliveryTime,
      location,
      lat,
      lng,
      isOpen,
    } = body as {
      name?: unknown;
      cuisine?: unknown;
      image?: unknown;
      rating?: unknown;
      deliveryTime?: unknown;
      location?: unknown;
      lat?: unknown;
      lng?: unknown;
      isOpen?: unknown;
    };

    if (typeof name === "string" && name.trim().length > 0) {
      restaurant.name = name.trim();
    }
    if (Array.isArray(cuisine)) {
      restaurant.cuisine = cuisine.filter((c) => typeof c === "string");
    }
    if (typeof image === "string" && image.trim().length > 0) {
      restaurant.image = image.trim();
    }
    if (typeof rating === "number") {
      restaurant.rating = Math.min(5, Math.max(0, rating));
    }
    if (typeof deliveryTime === "number" && deliveryTime > 0) {
      restaurant.deliveryTime = deliveryTime;
    }
    if (typeof location === "string" && location.trim().length > 0) {
      restaurant.location = location.trim();
    }
    if (typeof isOpen === "boolean") {
      restaurant.isOpen = isOpen;
    }

    if (typeof lat === "number" && typeof lng === "number") {
      if (!isValidCoordinates(lat, lng)) {
        return NextResponse.json(
          { error: "Coordinates must have latitude -90..90 and longitude -180..180" },
          { status: 400 }
        );
      }
      restaurant.coordinates = {
        type: "Point",
        coordinates: [lng, lat], // GeoJSON [lng, lat]
      };
    }

    await restaurant.save();

    return NextResponse.json({ restaurant: serializeDoc(restaurant) }, { status: 200 });
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
      return NextResponse.json({ error: "Invalid restaurant ID" }, { status: 400 });
    }

    const authUser = await verifyAuthFromRequest(request);
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin required" }, { status: 403 });
    }

    await connectDB();

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    // Cascade delete menu items belonging to this restaurant
    await MenuItem.deleteMany({ restaurantId: restaurant._id });
    await Restaurant.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Restaurant and all associated menu items deleted successfully" },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
