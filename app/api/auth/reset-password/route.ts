import { NextRequest, NextResponse } from "next/server";
import {
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import crypto from "crypto";

function computeSecretHash(username: string) {
  const clientId = process.env.COGNITO_CLIENT_ID;
  const clientSecret = process.env.COGNITO_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Missing Cognito client env");
  return crypto.createHmac("sha256", clientSecret).update(username + clientId).digest("base64");
}

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function POST(req: NextRequest) {
  try {
    const { email, code, newPassword } = await req.json();
    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { message: "Email, code, and new password are required" },
        { status: 400 }
      );
    }

    const cmd = new ConfirmForgotPasswordCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword,
      SecretHash: computeSecretHash(email),
    });

    await cognitoClient.send(cmd);

    return NextResponse.json({ success: true, message: "Password reset successful" });
  } catch (e: any) {
    const name = e?.name;
    const msg = e?.message || "Reset failed";

    if (name === "CodeMismatchException") {
      return NextResponse.json({ message: "Invalid reset code" }, { status: 400 });
    }
    if (name === "ExpiredCodeException") {
      return NextResponse.json({ message: "Reset code expired. Request a new code." }, { status: 400 });
    }
    if (name === "InvalidPasswordException") {
      return NextResponse.json({ message: "Password does not meet requirements" }, { status: 400 });
    }

    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
