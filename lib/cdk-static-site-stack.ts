import { 
	Stack,
	StackProps,
	aws_s3 as s3,
	aws_cloudfront as cf,
	aws_cloudfront_origins as origins,
	aws_s3_deployment as s3deploy
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class StaticSiteStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'CdkStaticSiteQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
    const accessIdentity = new cf.OriginAccessIdentity(scope, `StaticSiteAccessIdentity-${props.stackId}`);

    const siteBucket = new s3.Bucket(scope, `StaticSiteBucket-${props.stackId}`, {
	    bucketName: `StaticSiteBucket-${props.stackId}`,
	    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    siteBucket.grantRead(accessIdentity);

    s3deploy.BucketDeployment(scope, `StaticSiteBucketDeployment-${props.stackId}`, {
	    sources: [s3deploy.Source.asset(props.contentPath)],
	    destinationBucket: siteBucket
    });

    const distro = new cf.Distribution(scope, `StaticSiteDistribution-${props.stackId}`, {
	    defaultBehavior: {
		    origin: new origins.S3Origin(siteBucket, {
			    originAccessIdentity: accessIdentity 
		    })
	    },
    });
  }
}
