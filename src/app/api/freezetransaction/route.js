// app/api/route.js 👈🏽

import { Transaction } from "@/utils/models";
import { NextResponse } from "next/server";
import connect from "@/utils/connect";

// To handle a GET request to /api
export async function GET(req) {
  try {
    await connect();
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");
    console.log("freeze", id);
    if (!id)
      return NextResponse.json(
        { status: "error", message: "invalid data" },
        { status: 400 }
      );
    let conditionDoc = await Transaction.updateOne({ _id: id }, { frozen: true });
    if (conditionDoc.modifiedCount == 0) {
      return NextResponse.json(
        { status: "error", message: "couldn't find transaction" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { status: "ok", message: "frozen" },
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
