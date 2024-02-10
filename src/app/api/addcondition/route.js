// app/api/route.js 👈🏽

import { Condition, Transaction } from "@/utils/models";
import connect from "@/utils/connect";
import { NextResponse } from "next/server";

// To handle a POST request to /api
export async function POST(req) {
  try {
    await connect();
    const data = await req.json();
    console.log(data);
    if (
      !data?.parent &&
      !data?.content &&
      data?.acceptedSeller !== undefined &&
      data?.acceptedBuyer !== undefined
    )
      return NextResponse.json(
        { status: "error", message: "invalid data" },
        { status: 400 }
      );
    let conditionDoc = await Transaction.findById(data.parent);
    if (!conditionDoc) {
      return NextResponse.json(
        { status: "error", message: "parent doesn't exists" },
        { status: 400 }
      );
    }
    conditionDoc = await new Condition({ ...data }).save();
    console.log(conditionDoc);
    return NextResponse.json(
      { status: "ok", message: "saved", data: {id: conditionDoc._id} },
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
