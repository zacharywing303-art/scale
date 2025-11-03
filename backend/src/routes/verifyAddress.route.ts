import { Router, Request, Response } from "express";
// Use the global fetch available in Node 18+; if you target older Node versions, install node-fetch and its types instead.

const router = Router();

/**
 * POST /api/verify-address
 * Body: { addressLine1, city, state, zipcode }
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { addressLine1, city, state, zipcode } = req.body;
    if (!addressLine1 || !city || !state || !zipcode)
      return res.status(400).json({ message: "Missing required fields" });

    const address = `${addressLine1}, ${city}, ${state} ${zipcode}`;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${process.env.GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" || !data.results?.length) {
      return res.status(404).json({ message: "No address found" });
    }

    const best = data.results[0];
    const loc = best.geometry?.location || {};
    const comps = best.address_components || [];

    // Helper function
    const get = (type: string) =>
      comps.find((c: any) => c.types.includes(type))?.long_name || "";

    const standardized = {
      formattedAddress: best.formatted_address,
      addressLine1: `${get("street_number")} ${get("route")}`.trim(),
      city: get("locality") || get("sublocality") || "",
      state: get("administrative_area_level_1") || state,
      zipcode: get("postal_code") || zipcode,
      county: get("administrative_area_level_2") || "",
      latitude: loc.lat || null,
      longitude: loc.lng || null,
    };

    res.json({ standardized });
  } catch (err: any) {
    console.error("Verify address error:", err);
    res.status(500).json({ message: "Failed to verify address" });
  }
});

export default router;
