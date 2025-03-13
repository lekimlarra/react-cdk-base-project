# Welcome

This is a repository to fork when creating a new static website in AWS.
This CDK project will automatically create for you:

- A S3 bucket to host a public website
- An API with lambdas for each endpoint
- An API key to control the access and usage of your API
- A configurable AWS budget to make sure you don't get a surprise big bill, in USD, with 2 steps:
  - First an email once you reach `budgetFirstNotificationLimit`
  - Blocking all internet access to this project once you reach `budgetStopServiceLimit` (PENDING)
- Cloudfront layer for caching and centralizing internet access to your app
- A DynamoDB database to take advantage of the AWS free tier
- Creating cognito pool and pool client to connect your user website
- Diagram of the infrastructure that will be deployed

Soon:

- Automatic deploy from GitHub actions and secrets
- Dashboard in CloudWatch (may incur costs!! 💶💵🤑)
- Observability (incurs costs!! 💶💵🤑)
- Alerting (incurs costs!! 💶💵🤑) - Errors 4XX or 5XX, spike in number of connections...
- Route 53 domain url
- HTTPS certificate

## Getting started

Follow these steps to get started:

1. Download and install depencencies `npm`, `aws cli` and `cdk`
1. You might need to run `cdk bootstrap` in your AWS account if this is the first time you use CDK.
1. Configure your local environment to login to AWS. This project will deploy to the region you hace as default
1. Review the `.env` file and change the values to whatever you want (In a section below all the parameters are explained)
1. Run `npm i` in the main folder of this project and inside the website react folder.
1. Write your react website (or change it by any other static website)
1. Create and write your APi endpoints in the lambda folder
1. If you want to filter your budget for only the resources on this project, you will need to create

### Important commands

- `aws sso login` to login to AWS before doing a deploy
- `npm run build` compile the react website (run it in the folder of the website configured in `websiteBuildPath`)
- `cdk deploy` to deploy the infrastructure

### Customization

In the file `.env` you can customize your application. These are the values:

```properties
# Your variables
bucketName - The name of the S3 bucket you will create
# Soon httpCertificate=arn:aws:acm:us-east-1:ACCOUNT:certificate/UUID
yourDomain - Your url domain starting with https://
notificationEmail - Your email to receive notifications from the budgets
budgetFirstNotificationLimit - Limit in $ for the monthly expense where, if exceeded, you will receive an email
budgetStopServiceLimit - Limit in $ for the monthly expense where, if exceeded, your website will be disconnected from the internet --> NOT READY YET
budgetName - The name of the budget
restApiName - The name of your API

# Cognito
createCognito - Boolean, if true, will create a cognito pool and client
userPoolName - Pool name
userPoolClientName - Pool client name
cognitoCallBackPath - The path url for call back when using cognito to manage your users. We recommend leaving the default "/auth/callback"

# API key - See api key documentation to know more about quota, burst and rate limits
apyKeyName - Name of the api key you will create
apyKeyQuota=1000
apiKeyRateLimit=5
apyKeyBurstLimit=5

# Single time creation tags
appDeployedOnce - This is important, a Boolean. The Budget can only be created once, so after your first "cdk deploy", you must set this to "true"
```

## Infrastructure

Here is a diagram of the infrastructure you can create with this project:
![Infrastructure Diagram](/docs/cdk-template-infra.jpg)

### API

The API will create a stage under the path in the `.env` parameter called `apiProdBasePath`.

#### API endpoints

To create a new endpoint, add a new file (for now only Python) in the `resources/lambdas` folder.
You should name your file following this nomenclature `METHOD-functionName#PATH_VARIABLE1#PATH_VARIABLE2.py`, where:

- `METHOD` will be used to create the endpoint with the method specified: `GET`, `POST`, `PUT`, etc.
- `PATH_VARIABLEX` will be user to create a path variable.
  For example, `GET-users#userId.py` will create a GET endpoint with a url like `/api/getuser/:userId` with the lambda.

#### API usage

When creating an API, an API key is automatically generated to limit the usage of the API if necessary.
You will need to retrieve the key value from your AWS account.
You can configure the API key values in the `.env` file.

### DATABASE

You can create your own databases by creating JSON files inside the folder `/resources/databases`.
The JSON files must follow this structure:

```JSON
{
    "pk": "pkId",
    "pkType": "S",
    "sk": "skId",
    "skType": "S"
}
```

Where:

- `pk` is the partition key. This field is mandatory
- `pkType` is the type of the partition key. This field is mandatory.
- `sk` is the sort key. This field is optional.
- `skType` is the type of the partition key. This field is optional, but only if there is no `sk`.

The types can be:

- `B`: Binary
- `N`: Number
- `S`: String

### Cloudfront distribution

This project creates a cloudfront distribution to serve your API and your website. Cloudfront is used for many things, but for this project, the main 2 advantages are:

- Caching the website
- Centralizing access from the internet to our resources, so if we want to cut service due to a sudden increase in our bill, we can just configure this distribution

#### Access to resources

The distribution has 2 behaviours:

1. `/api/*` redirection to the API gateway. You can change this value by changing the parameter `apiProdBasePath` in the `.env` file.
1. Default to S3 static website

> Make sure to avoid collisions between the path to the API and any URL on your static website.

### Cognito

If you want to have users with login in your website, you can set the parameter `createCognito` to `true` in the `.env` file. This will create a Cognito Pool and a Cognito Pool Client that you can use to manage your user sessions.
In the file [Cognito on react.md](/docs/Cognito%20on%20react.md) you can see a detailed explanation on how to connect your react website to cognito in a very simple way.

### Expected costs of this infrastructure

With all these AWS products, we are taking advantage of the free tier, but with enough usage, you will surpase the thresholds for the free tier.
In [this document](/docs/Free%20tier%20short%20explanation.md) you can see the detailed list of what to expect (as of March2025 and an approximation/simplification, visit AWS pricing website for the real values).

### Component Ideas

- Loaders:
  - Campfire https://uiverse.io/Admin12121/stupid-mouse-29
  - World https://uiverse.io/Novaxlo/rotten-lionfish-4
- Toggles:
  - https://uiverse.io/Nawsome/silent-owl-45
