import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const db = sql();
  try {
    const body = await req.json();

    if ("completed" in body) {
      const result = await db`
        UPDATE todos
        SET completed = ${body.completed}, completed_at = ${body.completed ? new Date().toISOString() : null}
        WHERE id = ${id}
        RETURNING *
      `;
      return NextResponse.json(result[0]);
    }

    const result = await db`
      UPDATE todos
      SET
        title = COALESCE(${body.title ?? null}, title),
        description = COALESCE(${body.description ?? null}, description),
        assignee = COALESCE(${body.assignee ?? null}, assignee),
        requested_by = COALESCE(${body.requested_by ?? null}, requested_by),
        category = COALESCE(${body.category ?? null}, category),
        priority = COALESCE(${body.priority ?? null}, priority),
        due_time = COALESCE(${body.due_time ?? null}, due_time),
        estimated_minutes = COALESCE(${body.estimated_minutes ?? null}, estimated_minutes)
      WHERE id = ${id}
      RETURNING *
    `;
    return NextResponse.json(result[0]);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const db = sql();
  try {
    await db`DELETE FROM todos WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
