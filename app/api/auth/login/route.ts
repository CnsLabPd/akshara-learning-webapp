// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
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
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
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

    const authCommand = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: process.env.COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
        SECRET_HASH: computeSecretHash(email),
      },
    });

    const authResponse = await cognitoClient.send(authCommand);

    if (!authResponse.AuthenticationResult) {
      return NextResponse.json(
        { message: "Authentication failed" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      accessToken: authResponse.AuthenticationResult.AccessToken,
      idToken: authResponse.AuthenticationResult.IdToken,
      refreshToken: authResponse.AuthenticationResult.RefreshToken,
      expiresIn: authResponse.AuthenticationResult.ExpiresIn,
      email,
    });
  } catch (error: any) {
    console.error("Login error:", error);

    const name = error?.name as string | undefined;
    const msg = (error?.message as string | undefined) ?? "";

    if (name === "NotAuthorizedException") {
      // can be wrong password OR missing secret hash, but we now send it
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    if (name === "UserNotConfirmedException") {
      return NextResponse.json(
        { message: "User is not confirmed. Please verify your email." },
        { status: 403 }
      );
    }

    if (name === "UserNotFoundException") {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    return NextResponse.json({ message: msg || "Login failed" }, { status: 500 });
  }
}
