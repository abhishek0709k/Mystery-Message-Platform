import mongoose, { Schema, Document } from "mongoose"

export interface Message extends Document {
    message: string;
    createdAt: Date;
    _id: string;
}

const MessageSchema: Schema<Message> = new Schema({
    message: {
        type: String,
    },
    createdAt: {
        type: Date
    }
}, { timestamps: true });

export interface User extends Document {
    email: string;
    password: string;
    username: string;
    verificationCode: string;
    verificationCodeExpiry: Date;
    messages: Message[];
    isAcceptableMessage: boolean;
    isVerified: boolean;
}

const UserSchema: Schema<User> = new Schema({
    username: {
        type: String,
        required: [true, "username is required"],
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please use a valid email"]
    },
    password: {
        type: String,
        required: true
    },
    verificationCode: {
        type: String,
        required: true
    },
    verificationCodeExpiry: {
        type: Date,
        required: true
    },
    messages: [
        MessageSchema
    ],
    isAcceptableMessage: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", UserSchema);

export default UserModel;
