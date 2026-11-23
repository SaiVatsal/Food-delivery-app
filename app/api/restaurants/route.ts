import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Restaurant } from "@/models/Restaurant";
import { MenuItem } from "@/models/MenuItem";
import { isValidCoordinates } from "@/lib/geo";
import { serializeDocs } from "@/lib/serialize";
import type { PipelineStage } from "mongoose";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
    const radiusParam = searchParams.get("radiusKm");
    const city = searchParams.get("city");
    const cuisine = searchParams.get("cuisine");
    const vegOnly = searchParams.get("vegOnly") === "true";

    await connectDB();

    // Prepare vegOnly restaurant IDs if requested
    let vegRestaurantIds: unknown[] | null = null;
    if (vegOnly) {
      vegRestaurantIds = await MenuItem.find({
        isVeg: true,
        isAvailable: true,
      }).distinct("restaurantId");
    }

    if (latParam !== null && lngParam !== null) {
      const lat = parseFloat(latParam);
      const lng = parseFloat(lngParam);
      const radiusKm = radiusParam ? parseFloat(radiusParam) : 10;

      if (!isValidCoordinates(lat, lng)) {
        return NextResponse.json(
          { error: "Invalid latitude or longitude coordinates" },
          { status: 400 }
        );
      }

      if (Number.isNaN(radiusKm) || radiusKm <= 0 || radiusKm > 100) {
        return NextResponse.json(
          { error: "radiusKm must be a number between 0 and 100" },
          { status: 400 }
        );
      }

      // GeoNear query filters
      const geoQuery: Record<string, unknown> = {
        isOpen: true,
      };

      if (city && city.trim() !== "" && city.toLowerCase() !== "all") {
        geoQuery.location = { $regex: new RegExp(city.trim(), "i") };
      }

      if (cuisine && cuisine.trim() !== "" && cuisine.toLowerCase() !== "all") {
        geoQuery.cuisine = { $in: [cuisine.trim()] };
      }

      if (vegOnly && vegRestaurantIds) {
        geoQuery._id = { $in: vegRestaurantIds };
      }

      // $geoNear MUST be the FIRST aggregation stage
      const pipeline: PipelineStage[] = [
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [lng, lat], // GeoJSON [lng, lat]
            },
            distanceField: "distanceMeters",
            maxDistance: radiusKm * 1000,
            spherical: true,
            query: geoQuery,
          },
        },
        {
          $addFields: {
            distanceKm: {
              $round: [{ $divide: ["$distanceMeters", 1000] }, 1],
            },
          },
        },
      ];

      const restaurants = await Restaurant.aggregate(pipeline);
      return NextResponse.json(
        { restaurants: serializeDocs(restaurants) },
        { status: 200 }
      );
    }

    // Fallback: Non-geospatial listing
    const query: Record<string, unknown> = {
      isOpen: true,
    };

    if (city && city.trim() !== "" && city.toLowerCase() !== "all") {
      query.location = { $regex: new RegExp(city.trim(), "i") };
    }

    if (cuisine && cuisine.trim() !== "" && cuisine.toLowerCase() !== "all") {
      query.cuisine = { $in: [cuisine.trim()] };
    }

    if (vegOnly && vegRestaurantIds) {
      query._id = { $in: vegRestaurantIds };
    }

    const restaurants = await Restaurant.find(query).sort({ rating: -1 });
    return NextResponse.json(
      { restaurants: serializeDocs(restaurants) },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
