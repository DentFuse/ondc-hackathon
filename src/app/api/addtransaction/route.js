// app/api/route.js 👈🏽

import { Transaction } from "@/utils/models";
import connect from "@/utils/connect";
import { NextResponse } from "next/server";

// To handle a POST request to /api
export async function POST(req) {
  try {
    await connect();
    const data = await req.json();
    console.log(data);
    if (
      !data?.buyerName ||
      !data?.sellerName ||
      !data?.title ||
      data?.price === undefined
    )
      return NextResponse.json(
        { status: "error", message: "invalid data" },
        { status: 400 }
      );
    let transaction = await new Transaction({
      buyer: data.buyerName,
      seller: data.sellerName,
      price: data.price,
      title: data.title,
      frozen: false
    }).save();
    console.log(transaction);
    return NextResponse.json(
      { status: "ok", message: "saved", data: { id: transaction._id } },
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
