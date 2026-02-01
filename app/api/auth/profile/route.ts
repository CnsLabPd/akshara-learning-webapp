// app/api/auth/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "akshara-users";

// GET - Fetch user profile
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userSub = searchParams.get("userSub");

    if (!userSub) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    const getCommand = new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        userSub: userSub,
      },
    });

    const response = await docClient.send(getCommand);

    if (!response.Item) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      userSub: response.Item.userSub,
      email: response.Item.email,
      fullName: response.Item.fullName,
      progress: response.Item.progress,
      createdAt: response.Item.createdAt,
    });
  } catch (error: unknown) {
    console.error("Get profile error:", error);

    return NextResponse.json(
      { message: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PUT - Update user profile/progress
export async function PUT(request: NextRequest) {
  try {
    const { userSub, fullName, progress } = await request.json();

    if (!userSub) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    // Build update expression dynamically
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, unknown> = {};

    if (fullName) {
      updateExpressions.push("#fullName = :fullName");
      expressionAttributeNames["#fullName"] = "fullName";
      expressionAttributeValues[":fullName"] = fullName;
    }

    if (progress) {
      updateExpressions.push("#progress = :progress");
      expressionAttributeNames["#progress"] = "progress";
      expressionAttributeValues[":progress"] = {
        ...progress,
        lastActivity: new Date().toISOString(),
      };
    }

    // Always update the updatedAt timestamp
    updateExpressions.push("#updatedAt = :updatedAt");
    expressionAttributeNames["#updatedAt"] = "updatedAt";
    expressionAttributeValues[":updatedAt"] = new Date().toISOString();

    const updateCommand = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        userSub: userSub,
      },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    });

    const response = await docClient.send(updateCommand);

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile: response.Attributes,
    });
  } catch (error: unknown) {
    console.error("Update profile error:", error);

    return NextResponse.json(
      { message: "Failed to update profile" },
      { status: 500 }
    );
  }
}
