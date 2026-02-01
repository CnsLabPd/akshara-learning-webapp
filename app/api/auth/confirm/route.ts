// app/api/auth/confirm/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import crypto from "crypto";

function computeSecretHash(username: string) {
  const clientId = process.env.COGNITO_CLIENT_ID;
  const clientSecret = process.env.COGNITO_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing COGNITO_CLIENT_ID or COGNITO_CLIENT_SECRET");
  }

  return crypto
    .createHmac("sha256", clientSecret)
    .update(username + clientId)
    .digest("base64");
}

const region = process.env.AWS_REGION || "us-east-1";

const cognitoClient = new CognitoIdentityProviderClient({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    // Validate input
    if (!email || !code) {
      return NextResponse.json(
        { message: "Email and verification code are required" },
        { status: 400 }
      );
    }

    if (!process.env.COGNITO_CLIENT_ID) {
      return NextResponse.json(
        { message: "Missing env var: COGNITO_CLIENT_ID" },
        { status: 500 }
      );
    }
    if (!process.env.COGNITO_CLIENT_SECRET) {
      return NextResponse.json(
        { message: "Missing env var: COGNITO_CLIENT_SECRET" },
        { status: 500 }
      );
    }

    // Confirm sign up with Cognito (SECRET_HASH required because client has secret)
    const confirmCommand = new ConfirmSignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      SecretHash: computeSecretHash(email),
      Username: email,
      ConfirmationCode: code,
    });

    await cognitoClient.send(confirmCommand);

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error: any) {
    console.error("Confirmation error:", error);

    const name = error?.name as string | undefined;
    const msg = (error?.message as string | undefined) ?? "";

    if (name === "CodeMismatchException") {
      return NextResponse.json(
        { message: "Invalid verification code" },
        { status: 400 }
      );
    }

    if (name === "ExpiredCodeException") {
      return NextResponse.json(
        { message: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    if (name === "UserNotFoundException") {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // ✅ Treat already-confirmed as SUCCESS (idempotent confirm)
    if (
      name === "NotAuthorizedException" &&
      msg.toLowerCase().includes("already confirmed")
    ) {
      return NextResponse.json({
        success: true,
        alreadyConfirmed: true,
        message: "User already confirmed. Please sign in.",
      });
    }

    return NextResponse.json(
      { message: msg || "Verification failed" },
      { status: 500 }
    );
  }
}
