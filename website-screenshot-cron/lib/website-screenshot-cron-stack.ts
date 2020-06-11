import * as cdk from '@aws-cdk/core';
import { Bucket } from '@aws-cdk/aws-s3';
import * as lambda from '@aws-cdk/aws-lambda';
import { Rule, Schedule } from '@aws-cdk/aws-events';
import * as Target from '@aws-cdk/aws-events-targets';

export class WebsiteScreenshotCronStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 bucket
    const bucket = new Bucket(this, "url-bucket");

    // Chrome browser lambda layer
    const layer = lambda.LayerVersion.fromLayerVersionAttributes(this, 'Layer', {
      layerVersionArn: "arn:aws:lambda:us-west-2:764866452798:layer:chrome-aws-lambda:8",
      compatibleRuntimes: [lambda.Runtime.NODEJS_12_X]
    });

    // lambda function
    const fn = new lambda.Function(this, "screenshot", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "screenshot.handler",
      environment: {
        TARGET_URL: "https://www.nytimes.com/",
        S3_BUCKET: bucket.bucketName
      },
      layers: [layer],
      memorySize: 1600,
      timeout: cdk.Duration.minutes(1)
    });

    
    // grant permission for lambda function to write to s3 bucket
    bucket.grantWrite(fn);

    // event schedule once a day
    const eventRule = new Rule(this, "cron-screenshot", {
      schedule: Schedule.cron({minute: "0", hour: "10"}), // runs every day at 10:00 am
    });
    // Set function as rule target
    eventRule.addTarget(new Target.LambdaFunction(fn));
  }
}
