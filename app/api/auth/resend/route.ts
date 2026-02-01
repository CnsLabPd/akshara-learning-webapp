// app/api/auth/resend/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  CognitoIdentityProviderClient,
  ResendConfirmationCodeCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Resend confirmation code with Cognito
    const resendCommand = new ResendConfirmationCodeCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
    });

    await cognitoClient.send(resendCommand);

    return NextResponse.json({
      success: true,
      message: "Verification code sent successfully",
    });
  } catch (error: unknown) {
    console.error("Resend code error:", error);

    const cognitoError = error as { name?: string; message?: string };

    if (cognitoError.name === "UserNotFoundException") {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (cognitoError.name === "InvalidParameterException") {
      return NextResponse.json(
        { message: "User is already confirmed" },
        { status: 400 }
      );
    }

    if (cognitoError.name === "LimitExceededException") {
      return NextResponse.json(
        { message: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { message: cognitoError.message || "Failed to resend code" },
      { status: 500 }
    );
  }
}
