import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Session is not available. Please sign in.",
        },
        { status: 401 }
      );
    }

    const userId = new mongoose.Types.ObjectId(session.user._id);
    const user = await UserModel.findById(userId)
    const data = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: "$messages" },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },
    ]);

    // check if user has any messages
    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          success: true,
          Messages: [],
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        isAcceptable : user?.isAcceptableMessage,
        Messages: data[0].messages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error while getting messages:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error while getting messages.",
      },
      { status: 500 }
    );
  }
}
