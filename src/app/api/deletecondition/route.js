// app/api/route.js 👈🏽

import { Condition } from "@/utils/models";
import { NextResponse } from "next/server";
import connect from "@/utils/connect";

// To handle a GET request to /api
export async function GET(req) {
  try {
    await connect();
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");
    console.log("delete", id);
    if (!id)
      return NextResponse.json(
        { status: "error", message: "invalid data" },
        { status: 400 }
      );
    let conditionDoc = await Condition.deleteOne({ _id: id });
    if (conditionDoc.deletedCount == 0) {
      return NextResponse.json(
        { status: "error", message: "couldn't find condition" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { status: "ok", message: "deleted" },
      { status: 200 }
    );
  } catch (e) {
    console.log("error: " + e);
    return NextResponse.json(
      { status: "error", message: "an error occured" },
      { status: 500 }
    );
  }
}
