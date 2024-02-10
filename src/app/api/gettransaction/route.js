// app/api/route.js 👈🏽

import { Transaction, Condition } from "@/utils/models";
import connect from "@/utils/connect";
import { NextResponse } from "next/server";

// To handle a GET request to /api
export async function GET(req) {
  try {
    await connect();
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");
    console.log("get", id);
    let transaction = await Transaction.findById(id);
    if (!transaction) {
      return NextResponse.json(
        { status: "error", message: "transaction doesn't exist" },
        { status: 400 }
      );
    }
    let conditions = await Condition.find({ parent: id }).exec();
    console.log(conditions);
    return NextResponse.json(
      {
        status: "ok",
        message: "found",
        data: {
          buyer: transaction.buyer,
          seller: transaction.seller,
          price: transaction.price,
          title: transaction.title,
          frozen: transaction.frozen,
          conditions,
        },
      },
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
