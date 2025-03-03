# Welcome

This is a repository to fork when creating a new static website in AWS.
This CDK project will automatically create for you:

- A S3 bucket to host a public website
- An API with lambdas for each endpoint
- An API key to control the access and usage of your API
- A configurable AWS budget to make sure you don't get a surprise big bill, in USD, with 2 steps:
  - First an email once you reach `budgetFirstNotificationLimit`
  - Blocking all internet access to this project once you reach `budgetStopServiceLimit` (PENDING)
- Cloudfront layer for caching

Soon:

- A DynamoDB database to take advantage of the AWS free tier
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

### API endpoints

Para crear un nuevo endpoint, añade un fichero nuevo (por ahora solo python) en la carpeta `resources/lambdas`.
Debes llamar a tu fichero siguiendo esta nomenclatura `METHOD-functionName.py`. El `METHOD` se usará para crear el endpoint.
Por ejemplo `GET-users.py` creará un endpoint GET con la lambda.

### API usage

Al crear una API, creamos automáticamente una API key para limitar el uso de la API por si acaso.
El valor de la key tendrás que ir a buscarlo a tu cuenta de AWS.
Puedes configurar los valores del api key en el fichero `.env`.

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
