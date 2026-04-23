import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get("admin_token")?.value;
  if (token !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const sb = createServiceClient();

  const { data, error } = await sb
    .from("sermons")
    .select(`
      sermon_id, title, date, service_type, speaker,
      series_name, series_chapter, original_filename,
      scripture_references ( id, book, chapter, verse_start, verse_end, reference_text ),
      sermon_tags ( id, tag_type, tag_value )
    `)
    .eq("sermon_id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
