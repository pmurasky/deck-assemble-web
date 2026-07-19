import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { fetchSetPrintings } from "@/lib/api/catalog";

export async function GET(req: NextRequest) {
	const searchParams = req.nextUrl.searchParams;
	const page = Math.max(parseInt(searchParams.get("page") || "1", 10) - 1, 0);
	const size = parseInt(searchParams.get("limit") || "500", 10);
	const query = searchParams.get("q") ?? "";

	try {
		const data = await fetchSetPrintings("msh", { query, page, size });
		return NextResponse.json({ data });
	} catch {
		return NextResponse.json(
			{
				error: { code: "UPSTREAM_ERROR", message: "Set printings unavailable" },
			},
			{ status: 502 },
		);
	}
}
