// Test script to verify AWS setup
const { CognitoIdentityProviderClient, ListUsersCommand } = require("@aws-sdk/client-cognito-identity-provider");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");
require('dotenv').config({ path: '.env.local' });

async function testAWSSetup() {
  console.log('🔍 Testing AWS Setup for AksharA App\n');
  console.log('=====================================\n');

  // Check environment variables
  console.log('1️⃣  Checking Environment Variables:');
  const requiredEnvVars = [
    'COGNITO_CLIENT_ID',
    'COGNITO_CLIENT_SECRET',
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'DYNAMODB_TABLE_NAME'
  ];

  let allEnvVarsPresent = true;
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar}: ${envVar.includes('SECRET') || envVar.includes('KEY') ? '***' + process.env[envVar].slice(-4) : process.env[envVar]}`);
    } else {
      console.log(`❌ ${envVar}: MISSING`);
      allEnvVarsPresent = false;
    }
  }

  if (!allEnvVarsPresent) {
    console.error('\n❌ Some environment variables are missing. Please check your .env.local file.');
    process.exit(1);
  }

  console.log('\n2️⃣  Testing Cognito Connection:');
  try {
    const cognitoClient = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    // Extract User Pool ID from Client ID format
    const userPoolId = 'ap-south-1_OCtacPjq8'; // Hardcoded from our setup

    const listUsersCommand = new ListUsersCommand({
      UserPoolId: userPoolId,
      Limit: 1
    });

    const response = await cognitoClient.send(listUsersCommand);
    console.log(`✅ Cognito User Pool connected successfully`);
    console.log(`   User Pool ID: ${userPoolId}`);
    console.log(`   Current users: ${response.Users ? response.Users.length : 0}`);
  } catch (error) {
    console.error(`❌ Cognito connection failed: ${error.message}`);
  }

  console.log('\n3️⃣  Testing DynamoDB Connection:');
  try {
    const dynamoClient = new DynamoDBClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const docClient = DynamoDBDocumentClient.from(dynamoClient);

    const scanCommand = new ScanCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Limit: 1
    });

    const response = await docClient.send(scanCommand);
    console.log(`✅ DynamoDB table connected successfully`);
    console.log(`   Table: ${process.env.DYNAMODB_TABLE_NAME}`);
    console.log(`   Current items: ${response.Count || 0}`);
  } catch (error) {
    console.error(`❌ DynamoDB connection failed: ${error.message}`);
  }

  console.log('\n=====================================');
  console.log('✨ AWS Setup Test Complete!\n');
  console.log('Next steps:');
  console.log('1. Run: npm run dev');
  console.log('2. Visit: http://localhost:3000');
  console.log('3. Test signup with a real email address');
  console.log('4. Check email for verification code');
  console.log('5. Complete signup and test login\n');
}

testAWSSetup().catch(console.error);