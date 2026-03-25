import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    version: "4.0.3",
    date: "2026-03-07",
    download: "/supdate/download",
  });
}
