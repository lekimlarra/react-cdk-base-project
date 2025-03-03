import * as cdk from "aws-cdk-lib";
import path = require("path");
import { Construct } from "constructs";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { aws_s3_deployment } from "aws-cdk-lib";
// Custom imports
import { myApi } from "./api";
import { budget } from "./budget";
import { Distribution, OriginProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { HttpOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
// Uncomment below when using cloudfront
/*import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { Distribution } from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";*/

const bucketName = process.env.bucketName ?? "";
const websiteBuildPath = process.env.websiteBuildPath ?? "../resources/website/build";
const httpCertificate = process.env.httpCertificate ?? "";
const baseUrl = process.env.baseUrl ?? "";

export class ReactCdkBaseProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ********************** API **********************
    const myAPI = new myApi(this, id, props);

    // ********************** WEBSITE - S3 **********************
    const websiteBucket = new Bucket(this, "s3bucket", {
      publicReadAccess: true,
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
      bucketName: bucketName,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      websiteIndexDocument: "index.html",
    });

    // ********************** CLOUDFRONT **********************
    //let certificateArn = httpCertificate;
    //const certificate = Certificate.fromCertificateArn(this, "Certificate", certificateArn);
    const cfDistribution = new Distribution(this, "myDist", {
      defaultBehavior: {
        origin: new HttpOrigin(`${websiteBucket.bucketWebsiteDomainName}`, {
          protocolPolicy: OriginProtocolPolicy.HTTP_ONLY, // Static website solo soporta HTTP (no HTTPS)
        }),
      },
      //domainNames: [baseUrl],
      //certificate: certificate,
    });

    // ********************** WEBSITE - S3 DEPLOYMENT **********************
    // Deploying website files to S3 bucket with a cloudfront cache invalidation!
    const deployment = new aws_s3_deployment.BucketDeployment(this, "DeployWebsite", {
      sources: [aws_s3_deployment.Source.asset(path.join(__dirname, websiteBuildPath))],
      destinationBucket: websiteBucket,
      // Uncomment below when using cloudfront. These lines invalidate the cache on cloudfront when deploying new files
      //distribution: cfDistribution,
      //distributionPaths: ["/*"],
    });

    // ********************** BUDGET **********************
    const myBudget = new budget(this, id, props);

    // ********************** CDK OUTPUTS **********************
    new cdk.CfnOutput(this, "BucketUrl", {
      value: websiteBucket.bucketWebsiteUrl,
    });
    new cdk.CfnOutput(this, "CloudFrontUrl", {
      value: cfDistribution.domainName,
    });
  }
}
