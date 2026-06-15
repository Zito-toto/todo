import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await req.json();

    if ("completed" in body) {
      const result = await sql`
        UPDATE todos
        SET completed = ${body.completed}, completed_at = ${body.completed ? "NOW()" : null}
        WHERE id = ${id}
        RETURNING *
      `;
      return NextResponse.json(result.rows[0]);
    }

    const result = await sql`
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
    return NextResponse.json(result.rows[0]);
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
  try {
    await sql`DELETE FROM todos WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
