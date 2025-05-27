import { Resend } from "resend"

export const resend = new Resend(process.env.RESENDEMAIL_API_KEY)
