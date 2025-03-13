import * as cdk from "aws-cdk-lib";
import path = require("path");
import { AttributeType, Table, TableProps } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
// Custom imports
import * as utils from "./utils";

function filterJson(files: Array<string>): Array<string> {
  // Filter the files that are not json
  return files.filter((file) => file.includes(".json"));
}

const databasePath = path.join(__dirname, process.env.databasePath ?? "../resources/databases");

export class database {
  allDBFiles = filterJson(utils.listFiles(databasePath));
  allTables: Table[] = [];
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    for (let db of this.allDBFiles) {
      // Create the database from the json configuration file
      console.log("Creating DB:", db);
      const tableName = path.parse(db).name;
      const fileData = utils.loadJsonData(`${databasePath}/${db}`);
      const pk: string = fileData.pk;
      const pkType: AttributeType = fileData.pkType;
      const sk: string = fileData.sk;
      const skType: AttributeType = fileData.skType;
      console.log(`\t Table namee: ${tableName}`);
      console.log(`\t Partition Key: ${pk} of type ${pkType}`);
      console.log(`\t Sort Key: ${sk} of type ${skType}`);
      let tableProps: TableProps;
      // If we have a sort key, we create the table with it
      if (sk) {
        tableProps = {
          sortKey: { name: sk, type: skType },
          partitionKey: { name: pk, type: pkType },
          tableName: tableName,
          removalPolicy: cdk.RemovalPolicy.RETAIN,
        };
      } else {
        tableProps = {
          partitionKey: { name: pk, type: pkType },
          tableName: tableName,
          removalPolicy: cdk.RemovalPolicy.RETAIN,
        };
      }
      const tableCreated = new Table(scope, tableName, tableProps);
      this.allTables.push(tableCreated);
    }
  }
}
