// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
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

const dynamoClient = new DynamoDBClient({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, password } = await request.json();

    // Validate input
    if (!fullName || !email || !password) {
      return NextResponse.json(
        { message: "Full name, email, and password are required" },
        { status: 400 }
      );
    }

    // Hard env checks (prevents confusing Cognito errors)
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

    // Sign up with Cognito (SECRET_HASH required because client has secret)
    const signUpCommand = new SignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      SecretHash: computeSecretHash(email),
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "name", Value: fullName },
      ],
    });

    const signUpResponse = await cognitoClient.send(signUpCommand);

    // Store user profile in DynamoDB
    if (signUpResponse.UserSub) {
      const putCommand = new PutCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME || "akshara-users",
        Item: {
          userSub: signUpResponse.UserSub,
          email,
          fullName,
          createdAt: new Date().toISOString(),
          progress: {
            totalLessons: 26,
            completedLessons: 0,
            practiceScore: 0,
            testScore: 0,
            lastActivity: new Date().toISOString(),
          },
        },
      });

      await docClient.send(putCommand);
    }

    return NextResponse.json({
      success: true,
      message:
        "User registered successfully. Please check your email for verification code.",
      userSub: signUpResponse.UserSub,
    });
  } catch (error: unknown) {
    console.error("Signup error:", error);

    const cognitoError = error as { name?: string; message?: string };

    if (cognitoError.name === "UsernameExistsException") {
      return NextResponse.json(
        { message: "An account with this email already exists" },
        { status: 400 }
      );
    }

    if (cognitoError.name === "InvalidPasswordException") {
      return NextResponse.json(
        { message: "Password does not meet requirements" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: cognitoError.message || "Signup failed" },
      { status: 500 }
    );
  }
}
