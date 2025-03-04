import * as cdk from "aws-cdk-lib";
import path = require("path");
import { Construct } from "constructs";
import { RestApi, LambdaIntegration, Period, ApiKey } from "aws-cdk-lib/aws-apigateway";
import { Function, Runtime, Code } from "aws-cdk-lib/aws-lambda";
// Custom imports
import * as utils from "./utils";
import { Table } from "aws-cdk-lib/aws-dynamodb";

const quota = process.env.apyKeyQuota ?? 1000;
const rateLimit = process.env.apiKeyRateLimit ?? 5;
const burstLimit = process.env.apyKeyBurstLimit ?? 5;
const lambdasPath = path.join(__dirname, process.env.lambdasPath ?? "../resources/lambdas");
const apyKeyName = process.env.apyKeyName ?? "";

export class myApi {
  allLambdaFiles = utils.listFiles(lambdasPath);
  metodos = utils.listMethods(this.allLambdaFiles);
  allLambdas: Function[] = [];
  constructor(scope: Construct, id: string, createdTables: Table[], props?: cdk.StackProps) {
    // Adding OPTIONS for CORS
    this.metodos.push("OPTIONS");
    console.log("All lambdas:", this.allLambdaFiles);
    console.log("All metodos:", this.metodos);
    // ********************** API **********************
    const api = new RestApi(scope, "DR-API", {
      defaultCorsPreflightOptions: {
        allowHeaders: ["Content-Type", "X-Amz-Date", "Authorization", "X-Api-Key", "x-api-key", "Access-Control-Allow-Origin"],
        allowMethods: this.metodos,
        allowCredentials: true,
        allowOrigins: ["*"],
      },
    });

    // ********************** KEYS AND USAGE PLANS **********************
    // Creating usage plan
    let usagePlanName = "basicUsagePlan";
    const basicPlan = api.addUsagePlan(usagePlanName, {
      name: usagePlanName,
      description: "This usage plan is just to be sure no one can use the API too much",
      quota: {
        limit: Number(quota),
        period: Period.MONTH,
      },
      throttle: {
        rateLimit: Number(rateLimit),
        burstLimit: Number(burstLimit),
      },
    });
    basicPlan.addApiStage({
      stage: api.deploymentStage,
    });
    // Creating key
    const basicKey = new ApiKey(scope, `${apyKeyName}`, {
      enabled: true,
      description: "This key is just to be sure no one can use the API too much",
      apiKeyName: apyKeyName,
    });
    basicPlan.addApiKey(basicKey);
    // ********************** ENDPOINTS **********************
    for (let lambda of this.allLambdaFiles) {
      // Checks if the file is python
      if (lambda.endsWith(".py")) {
        const fileName = lambda.split(".")[0];
        console.log(`Creating lambda: ${lambda} with name: ${fileName}`);
        const thisLambda = new Function(scope, `lambdaFunction-${lambda}`, {
          functionName: fileName,
          runtime: Runtime.PYTHON_3_13,
          handler: `${fileName}.lambda_handler`,
          environment: {},
          memorySize: 256,
          timeout: cdk.Duration.minutes(1),
          //ephemeralStorageSize: Size.mebibytes(1024),
          code: Code.fromAsset(lambdasPath),
        });
        // Creating the endpoint if lambda exists
        if (thisLambda) {
          const lambdaMethod = fileName.split("-")[0];
          const endpointPath = utils.createPath(fileName);
          console.log(`lambdaMethod: ${lambdaMethod} endpointPath: ${endpointPath}`);
          const currentLambda = new LambdaIntegration(thisLambda, {});
          api.root.addResource(endpointPath).addMethod(lambdaMethod, currentLambda, {
            apiKeyRequired: true,
          });

          new cdk.CfnOutput(scope, `endpoint-${endpointPath}`, {
            value: endpointPath,
          });
        }
        this.allLambdas.push(thisLambda);
      } else {
        console.error("Only python files are supported for lambdas");
      }
    }

    // ********************** GRANTING ACCESS FROM LAMBDAS TO LAMBDAS **********************
    for (let table of createdTables) {
      for (let fn of this.allLambdas) {
        table.grantReadWriteData(fn);
      }
    }

    // ********************** CDK OUTPUTS **********************
    new cdk.CfnOutput(scope, `APIURL`, {
      value: api.url,
    });
    new cdk.CfnOutput(scope, "apiKeyArn", {
      value: basicKey.keyArn,
    });
  }
}
