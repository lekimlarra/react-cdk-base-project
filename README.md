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

Soon:

- Diagram of the infrastructure that will be deployed
- Automatic deploy from GitHub actions and secrets
- Something with Cognito to synchronize with user creation
- Dashboard in CloudWatch (may incur costs!! 💶💵🤑)
- Observability (incurs costs!! 💶💵🤑)
- Alerting (incurs costs!! 💶💵🤑) - Errors 4XX or 5XX, spike in number of connections...
- Route 53 domain url
- HTTPS certificate

## Getting started

Follow these steps to get started:

1. Download and install depencencies `npm`, `aws cli` and `cdk`
1. Configure your local environment to login to AWS. This project will deploy to the region you hace as default
1. Review the `.env` file and change the values to whatever you want (In a section below all the parameters are explained)
1. Write your react website (or change it by any other static website)
1. Create and write your APi endpoints in the lambda folder
1. If you want to filter your budget for only the resources on this project, you will need to create

### Important commands

- `aws sso login` to login to AWS before doing a deploy
- `npm run build` compile the react website (run it in the folder of the website configured in `websiteBuildPath`)
- `cdk deploy` to deploy the infrastructure

## Custom variables

In the file `.env` you can customize your application. These are the values:

- bucketName:

## API

The API will create a stage under the path in the `.env` parameter called `apiProdBasePath`.

### API endpoints

To create a new endpoint, add a new file (for now only Python) in the `resources/lambdas` folder.
You should name your file following this nomenclature `METHOD-functionName.py`. The `METHOD` will be used to create the endpoint.
For example, `GET-users.py` will create a GET endpoint with the lambda.

### API usage

When creating an API, an API key is automatically generated to limit the usage of the API if necessary.
You will need to retrieve the key value from your AWS account.
You can configure the API key values in the `.env` file.

## DATABASE

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

## Cloudfront distribution

This project creates a cloudfront distribution to serve your API and your website. Cloudfront is used for many things, but for this project, the main 2 advantages are:

- Caching the website
- Centralizing access from the internet to our resources, so if we want to cut service due to a sudden increase in our bill, we can just configure this distribution

### Access to resources

The distribution has 2 behaviours:

1. `/api/*` redirection to the API gateway. You can change this value by changing the parameter `apiProdBasePath` in the `.env` file.
1. Default to S3 static website

> Make sure to avoid collisions between the path to the API and any URL on your static website.
