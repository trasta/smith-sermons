import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function checkAuth(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  return token === process.env.ADMIN_PASSWORD;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(req)) return unauthorized();
  const { id } = await params;
  const body = await req.json();
  const sb = createServiceClient();

  const { title, date, service_type, speaker, scripture_references, tags } = body;

  // Update core sermon fields
  const { error: sermonError } = await sb
    .from("sermons")
    .update({
      title:        title || null,
      date:         date || null,
      service_type: service_type || null,
      speaker:      speaker || "Doyle Smith",
    })
    .eq("sermon_id", id);

  if (sermonError) {
    return NextResponse.json({ error: sermonError.message }, { status: 500 });
  }

  // Get the UUID for this sermon
  const { data: sermonRow } = await sb
    .from("sermons")
    .select("id")
    .eq("sermon_id", id)
    .single();

  if (!sermonRow) {
    return NextResponse.json({ error: "Sermon not found" }, { status: 404 });
  }

  const uuid = sermonRow.id;

  // Replace scripture references
  if (scripture_references !== undefined) {
    await sb.from("scripture_references").delete().eq("sermon_id", uuid);
    if (scripture_references.length > 0) {
      const refs = scripture_references.map((r: any) => ({
        sermon_id:      uuid,
        book:           r.book,
        chapter:        r.chapter || null,
        verse_start:    r.verse_start || null,
        verse_end:      r.verse_end || null,
        reference_text: r.reference_text || r.book,
      }));
      await sb.from("scripture_references").insert(refs);
    }
  }

  // Replace tags
  if (tags !== undefined) {
    await sb.from("sermon_tags").delete().eq("sermon_id", uuid);
    if (tags.length > 0) {
      const tagRows = tags.map((t: any) => ({
        sermon_id:  uuid,
        tag_type:   t.tag_type,
        tag_value:  t.tag_value,
      }));
      await sb.from("sermon_tags").insert(tagRows);
    }
  }

  return NextResponse.json({ ok: true });
}
