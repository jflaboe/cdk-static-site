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

interface CdkStaticSiteStackProps extends StackProps {
	contentPath: string
}

export class CdkStaticSiteStack extends Stack {
  constructor(scope: Construct, id: string, props?: CdkStaticSiteStackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'CdkStaticSiteQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
    const accessIdentity = new cf.OriginAccessIdentity(this, `StaticSiteAccessIdentity-${id}`);
    let bucketName = `StaticSiteBucket-${id}`;
    console.log(bucketName);
    console.log(bucketName.toLowerCase());
    const siteBucket = new s3.Bucket(this, bucketName, {
	    bucketName: bucketName.toLowerCase(),
	    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    siteBucket.grantRead(accessIdentity);
    if (props && props.contentPath) {
	    const contentPath = props.contentPath;

    	const contentDeployment = new s3deploy.BucketDeployment(this, `StaticSiteBucketDeployment-${id}`, {
	    	sources: [s3deploy.Source.asset(props.contentPath)],
	    	destinationBucket: siteBucket
    	});
    }
    const distro = new cf.Distribution(this, `StaticSiteDistribution-${id}`, {
	    defaultBehavior: {
		    origin: new origins.S3Origin(siteBucket, {
			    originAccessIdentity: accessIdentity 
		    })
	    },
    });
  }
}
