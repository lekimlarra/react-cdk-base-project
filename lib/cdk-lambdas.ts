import * as cdk from "aws-cdk-lib";
import path = require("path");
import * as fs from "fs";
import { Construct } from "constructs";
import { Function, Runtime, Code } from "aws-cdk-lib/aws-lambda";
import { Table } from "aws-cdk-lib/aws-dynamodb";

const lambdasPath = path.join(__dirname, process.env.lambdasPath ?? "../resources/lambdas");

const listarArchivos = (directorio: string): string[] => {
  try {
    const archivos = fs.readdirSync(directorio);
    return archivos;
    //return archivos.map((archivo) => path.join(directorio, archivo));
  } catch (error) {
    console.error("Error al leer el directorio:", error);
    return [];
  }
};

export class myLambdas {
  allLambdaFiles = listarArchivos(lambdasPath);
  allLambdasFunctions: Function[] = [];
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
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
        this.allLambdasFunctions.push(thisLambda);
      } else {
        console.error("Only python files are supported for lambdas");
      }
    }
  }
}
