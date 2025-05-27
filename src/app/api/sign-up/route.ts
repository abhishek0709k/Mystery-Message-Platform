import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { username, email, password } = await request.json();
    const existedUserbyUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existedUserbyUsername) {
      return Response.json(
        {
          success: false,
          message: "Username already exist",
        },
        { status: 400 }
      );
    }
    const otp = Math.floor((Math.random() * 900000) + 100000).toString();
    const existedUserbyEmail = await UserModel.findOne({ email });
    if (existedUserbyEmail) {
      if (existedUserbyEmail.isVerified) {
        return Response.json({
          success: false,
          message: "User exist with this Email"
        });
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        existedUserbyEmail.password = hashedPassword;
        existedUserbyEmail.verificationCodeExpiry = new Date(Date.now() + 3600000)
        existedUserbyEmail.verificationCode = otp;

        await existedUserbyEmail.save()
        return Response.json({
          success: true,
          message: "Data updated successfully"
        }, { status: 200 })
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      const expiryData = new Date();
      expiryData.setHours(expiryData.getHours() + 1);

      
      const newUser = new UserModel({
        email,
        password: hashedPassword,
        username,
        verificationCode: otp,
        verificationCodeExpiry: expiryData,
        messages: [],
        isAcceptableMessage: true,
        isVerified: false,
      });

      await newUser.save();

      // sending verification Email
      const emailResponse = await sendVerificationEmail(email, username, otp);
      if (!emailResponse.success) {
        return Response.json(
          {
            success: false,
            message: "Error while sending Verification code",
          },
          { status: 400 }
        );
      } else {
        return Response.json(
          {
            success: true,
            message: "Verification code send successfully",
          },
          { status: 200 }
        );
      }
    }
  } catch (error) {
    console.log("Error while registering the user", error);
    return Response.json(
      {
        success: false,
        message: "Error while registering User",
      },
      { status: 500 }
    );
  }
}
