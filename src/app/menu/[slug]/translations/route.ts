import { NextRequest, NextResponse } from "next/server";
import { getBusinessBySlug, getTranslations } from "@/lib/menu/queries";
import { isDisplayLanguage } from "@/lib/menu/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const lang = request.nextUrl.searchParams.get("lang");
  if (!isDisplayLanguage(lang)) {
    return NextResponse.json({ error: "Invalid or missing lang parameter" }, { status: 400 });
  }

  const { slug } = await params;
  const business = await getBusinessBySlug(slug);
  if (!business) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const translations = await getTranslations(business.id, lang);
  return NextResponse.json(translations);
}
