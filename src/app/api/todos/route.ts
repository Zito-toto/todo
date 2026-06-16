import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { CreateTodoInput } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const db = sql();

  try {
    let result;
    if (date) {
      result = await db`
        SELECT * FROM todos WHERE date = ${date} ORDER BY due_time ASC NULLS LAST, created_at ASC
      `;
    } else if (month) {
      result = await db`
        SELECT * FROM todos WHERE TO_CHAR(date, 'YYYY-MM') = ${month} ORDER BY date ASC, due_time ASC NULLS LAST
      `;
    } else if (year) {
      result = await db`
        SELECT * FROM todos WHERE TO_CHAR(date, 'YYYY') = ${year} ORDER BY date ASC
      `;
    } else {
      return NextResponse.json(
        { error: "date, month, or year param required" },
        { status: 400 },
      );
    }
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const db = sql();
  try {
    const body: CreateTodoInput = await req.json();
    const result = await db`
      INSERT INTO todos (title, description, assignee, requested_by, category, priority, date, due_time, estimated_minutes)
      VALUES (
        ${body.title},
        ${body.description ?? null},
        ${body.assignee},
        ${body.requested_by ?? null},
        ${body.category},
        ${body.priority},
        ${body.date},
        ${body.due_time ?? null},
        ${body.estimated_minutes ?? null}
      )
      RETURNING *
    `;
    return NextResponse.json(result[0], { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
