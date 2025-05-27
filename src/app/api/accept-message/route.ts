import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import UserModel from "@/model/User";
import { authOptions } from "../auth/[...nextauth]/options";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { isAcceptingMessage } = await request.json();
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json(
        {
          success: false,
          message: "Session is not availavle, Please sign-up",
        },
        { status: 400 }
      );
    }
    const user = session.user;

    const existedUserByID = await UserModel.findById(user._id);
    if (!existedUserByID) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 400 }
      );
    }

    existedUserByID.isAcceptableMessage = isAcceptingMessage;
    const newUser = await existedUserByID.save();
    if (newUser) {
      return Response.json(
        {
          success: false,
          message: "Accepting Message is toggled",
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.log("Error while accepting message");
    return Response.json(
      {
        success: false,
        message: "Error while acceptiong message",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json(
        {
          success: false,
          message: "Session is not availavle, Please sign-up",
        },
        { status: 400 }
      );
    }
    const user = session.user;

    const existedUserByID = await UserModel.findById(user._id);
    if (!existedUserByID) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 400 }
      );
    }
    return Response.json(
      {
        success: true,
        isAcceptingMessage: existedUserByID.isAcceptableMessage,
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        success: true,
        message: "Error while getting isAcceptingMessage"
      },
      { status: 400 }
    );
  }
}
