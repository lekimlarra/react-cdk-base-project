# Welcome

This is a repository to fork when creating a new static website in AWS.

## Important commands

- `npm run build` compile the react website
- `cdk deploy` to deploy the infrastructure
- `aws sso login` to login to AWS before doing a deploy

# TODO

1. Add a Cost and usage report and a way to cut services if needed

## CDK TypeScript project

The `cdk.json` file tells the CDK Toolkit how to execute your app.

### Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `npx cdk deploy` deploy this stack to your default AWS account/region
- `npx cdk diff` compare deployed stack with current state
- `npx cdk synth` emits the synthesized CloudFormation template
