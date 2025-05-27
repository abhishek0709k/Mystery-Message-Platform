import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { Message } from "@/model/User";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, message } = await request.json();
    const existedUserbyUsername = await UserModel.findOne({ username });
    if (!existedUserbyUsername) {
      return Response.json(
        {
          success: true,
          message: "User not found",
        },
        { status: 404 }
      );
    }
    if (!existedUserbyUsername.isAcceptableMessage) {
      return Response.json(
        {
          success: false,
          message: "User is not accepting the message",
        },
        { status: 403 }
      );
    }
    const newMessage = {
      message: message,
      createdAt: new Date(),
    };
    existedUserbyUsername.messages.push(newMessage as Message);
    const updatedUser = await existedUserbyUsername.save();
    if (updatedUser) {
      return Response.json(
        {
          success: true,
          message: "Message sent successfully",
        },
        { status: 200 }
      );
    }
  } catch (error) {
    return Response.json(
      {
        success: true,
        message: "Error while sending Messages",
      },
      { status: 400 },
    );
  }
}
