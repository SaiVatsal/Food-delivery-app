import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Restaurant } from "@/models/Restaurant";
import { MenuItem } from "@/models/MenuItem";
import { serializeDoc, serializeDocs } from "@/lib/serialize";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid restaurant ID format" },
        { status: 400 }
      );
    }

    await connectDB();

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    const menuItems = await MenuItem.find({
      restaurantId: restaurant._id,
      isAvailable: true,
    }).sort({ category: 1, name: 1 });

    return NextResponse.json(
      {
        restaurant: serializeDoc(restaurant),
        menuItems: serializeDocs(menuItems),
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
