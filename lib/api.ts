import * as cdk from "aws-cdk-lib";
import path = require("path");
import * as fs from "fs";
import { Construct } from "constructs";
import { RestApi, LambdaIntegration, Period, ApiKey } from "aws-cdk-lib/aws-apigateway";
import { Function, Runtime, Code } from "aws-cdk-lib/aws-lambda";

const quota = process.env.apyKeyQuota ?? 1000;
const rateLimit = process.env.apiKeyRateLimit ?? 5;
const burstLimit = process.env.apyKeyBurstLimit ?? 5;
const lambdasPath = path.join(__dirname, process.env.lambdasPath ?? "../resources/lambdas");
const apyKeyName = process.env.apyKeyName ?? "";

const listarArchivos = (directorio: string): string[] => {
  try {
    const archivos = fs.readdirSync(directorio);
    return archivos;
  } catch (error) {
    console.error("Error al leer el directorio:", error);
    return [];
  }
};

const listarMetodos = (listaLambdas: string[]): string[] => {
  try {
    // Reducimos listaLambdas a solo el primer elemento tras split por - y capitalizamos
    let metodos: string[] = listaLambdas.map((lambda) => lambda.split("-")[0].toUpperCase());
    // Convertimos el metodos en un set para eliminar duplicados y volvemos a convertir a array
    metodos = Array.from(new Set(metodos));
    return metodos;
  } catch (error) {
    console.error("Error al leer metodos:", error);
    return [];
  }
};

// Función que crea el nombre del path del endpoint a partir del nombre del fichero
const crearPath = (nombreFichero: string): string => {
  // Transforma el texto en minúsculas y elimina los espacios
  return nombreFichero.split(".")[0].toLowerCase().replace("-", "");
};

export class myApi {
  allLambdaFiles = listarArchivos(lambdasPath);
  metodos = listarMetodos(this.allLambdaFiles);
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    // Añadimos OPTIONS, ya que es necesario para CORS
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
    // Creamos la lambda y después el endpoint
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
        // Si la lambda se ha creado correctamente, creamos el endpoint
        if (thisLambda) {
          const lambdaMethod = fileName.split("-")[0];
          const endpointPath = crearPath(fileName);
          console.log(`lambdaMethod: ${lambdaMethod} endpointPath: ${endpointPath}`);
          const currentLambda = new LambdaIntegration(thisLambda, {});
          api.root.addResource(endpointPath).addMethod(lambdaMethod, currentLambda, {
            apiKeyRequired: true,
          });

          new cdk.CfnOutput(scope, `endpoint-${endpointPath}`, {
            value: endpointPath,
          });
        }
        //this.allLambdasFunctions.push(thisLambda);
      } else {
        console.error("Only python files are supported for lambdas");
      }
    }

    // ********************** CDK OUTPUTS **********************
    new cdk.CfnOutput(scope, "apiKeyArn", {
      value: basicKey.keyArn,
    });
  }
}
