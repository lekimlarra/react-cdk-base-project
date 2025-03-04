import * as cdk from "aws-cdk-lib";
import path = require("path");
import { AttributeType, Table, TableProps } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
// Custom imports
import * as utils from "./utils";

const databasePath = path.join(__dirname, process.env.databasePath ?? "../resources/databases");

export class database {
  allDBFiles = utils.listFiles(databasePath);
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
        };
      } else {
        tableProps = {
          partitionKey: { name: pk, type: pkType },
          tableName: tableName,
        };
      }
      const tableCreated = new Table(scope, tableName, tableProps);
      this.allTables.push(tableCreated);
    }
  }
}
