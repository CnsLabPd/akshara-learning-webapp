import { NextRequest, NextResponse } from "next/server";
import {
  CognitoIdentityProviderClient,
  ForgotPasswordCommand,
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
    const { email } = await req.json();
    if (!email) return NextResponse.json({ message: "Email is required" }, { status: 400 });

    const cmd = new ForgotPasswordCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      SecretHash: computeSecretHash(email),
    });

    await cognitoClient.send(cmd);

    return NextResponse.json({ success: true, message: "Reset code sent" });
  } catch (e: any) {
    const name = e?.name;
    const msg = e?.message || "Failed";

    // keep message generic (good security)
    if (name === "UserNotFoundException") {
      return NextResponse.json({ success: true, message: "If the email exists, a code was sent." });
    }

    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
