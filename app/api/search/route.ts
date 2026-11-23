import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Restaurant } from "@/models/Restaurant";
import { MenuItem } from "@/models/MenuItem";
import { serializeDocs } from "@/lib/serialize";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";

    if (!q || q.length < 1) {
      return NextResponse.json(
        { restaurants: [], menuItems: [] },
        { status: 200 }
      );
    }

    await connectDB();

    const regex = new RegExp(q, "i");

    const [restaurants, menuItems] = await Promise.all([
      Restaurant.find({
        isOpen: true,
        $or: [{ name: { $regex: regex } }, { cuisine: { $in: [regex] } }],
      })
        .limit(10)
        .sort({ rating: -1 }),
      MenuItem.find({
        isAvailable: true,
        $or: [{ name: { $regex: regex } }, { description: { $regex: regex } }],
      })
        .populate("restaurantId", "name slug image location")
        .limit(20),
    ]);

    return NextResponse.json(
      {
        restaurants: serializeDocs(restaurants),
        menuItems: serializeDocs(menuItems),
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
