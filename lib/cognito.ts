import * as cdk from "aws-cdk-lib";
import { AccountRecovery, UserPool, UserPoolClient } from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

const yourDomain = process.env.yourDomain ?? "";
const logoutPath = process.env.logoutPath ?? "";
const cognitoCallBackPath = process.env.cognitoCallBackPath ?? "";
const userPoolName = process.env.userPoolName ?? "";
const userPoolClientName = process.env.userPoolClientName ?? "";

export class myCognito {
  public readonly userPool: UserPool;
  public readonly userPoolClient: UserPoolClient;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    // 1. Creating user pool, where users will be stored, the base of Cognito
    this.userPool = new UserPool(scope, "MyUserPool", {
      userPoolName: userPoolName,
      selfSignUpEnabled: true,
      signInAliases: { email: true }, // Login via email
      autoVerify: { email: true }, // Automatic email verification
      standardAttributes: {
        email: { required: true, mutable: false },
        givenName: { required: true, mutable: true },
        familyName: { required: true, mutable: true },
      },
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      accountRecovery: AccountRecovery.EMAIL_ONLY,
    });

    // 2. Creating pool client, where our website will connect to
    this.userPoolClient = new UserPoolClient(scope, "MyUserPoolClient", {
      userPool: this.userPool,
      userPoolClientName: userPoolClientName,
      authFlows: {
        userPassword: true, // For the login with email + password
      },
      oAuth: {
        callbackUrls: [`${yourDomain}${cognitoCallBackPath}`],
        logoutUrls: [`${yourDomain}${logoutPath}`],
        flows: {
          authorizationCodeGrant: true,
        },
      },
    });

    // 3. Salida de valores (para usarlos desde la web)
    new cdk.CfnOutput(scope, "UserPoolId", {
      value: this.userPool.userPoolId,
    });

    new cdk.CfnOutput(scope, "UserPoolClientId", {
      value: this.userPoolClient.userPoolClientId,
    });
  }
}
