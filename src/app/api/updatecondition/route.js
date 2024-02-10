// app/api/route.js 👈🏽

import { NextResponse } from "next/server";
import { Condition } from "@/utils/models";
import connect from "@/utils/connect";

// To handle a POST request to /api
export async function POST(req) {
  try {
    await connect();
    const data = await req.json();
    console.log(data);
    if (!data?.id)
      return NextResponse.json(
        { status: "error", message: "invalid id" },
        { status: 400 }
      );
    if (
      !data?.parent &&
      !data?.content &&
      data?.acceptedSeller !== undefined &&
      !data?.acceptedBuyer !== undefined
    )
      return NextResponse.json(
        { status: "error", message: "invalid data" },
        { status: 400 }
      );
    let conditionDoc = await Condition.findOneAndUpdate(
      { _id: data.id },
      { ...data }
    );
    if (!conditionDoc) {
      return NextResponse.json(
        { status: "error", message: "couldn't find condition" },
        { status: 400 }
      );
    }
    console.log(conditionDoc);
    return NextResponse.json(
      { status: "ok", message: "updated" },
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
