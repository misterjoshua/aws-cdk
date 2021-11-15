import * as path from 'path';
import { HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { ManagedPolicy } from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import { App, Stack, CfnOutput } from '@aws-cdk/core';
import { HttpIamAuthorizer } from '../../lib/http/iam';

/*
 * Stack verification steps:
 * * `curl <url>` should return 403
 * * `curl -H 'Authorization: ' -H 'x-amz-date: ' -H 'Accept: application/json' <url>` should return 200
 * @see [../integ.iam.signature/README.md] to generate header values using this stack's outputs
*/

const app = new App();
const stack = new Stack(app, 'IAMAuthorizerInteg');

const httpApi = new HttpApi(stack, 'MyHttpApi');

const authorizer = new HttpIamAuthorizer();

const handler = new lambda.Function(stack, 'lambda', {
  runtime: lambda.Runtime.NODEJS_12_X,
  handler: 'index.handler',
  code: lambda.AssetCode.fromAsset(path.join(__dirname, '../integ.lambda.handler')),
});

httpApi.addRoutes({
  path: '/',
  methods: [HttpMethod.GET],
  integration: new LambdaProxyIntegration({ handler }),
  authorizer,
});

const code = lambda.Code.fromDockerBuild(path.join(__dirname, '../integ.iam.handler'));

const testSigned = new lambda.Function(stack, 'TestSigned', {
  runtime: lambda.Runtime.PYTHON_3_9,
  handler: 'handler.test_signed',
  code: code,
  environment: {
    API_ENDPOINT: httpApi.url!,
  },
});

testSigned.role?.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonAPIGatewayInvokeFullAccess'));

new CfnOutput(stack, 'TestSignedFunction', {
  value: testSigned.functionName,
});

const testUnsigned = new lambda.Function(stack, 'TestUnsigned', {
  runtime: lambda.Runtime.PYTHON_3_9,
  handler: 'handler.test_unsigned',
  code: code,
  environment: {
    API_ENDPOINT: httpApi.url!,
  },
});

new CfnOutput(stack, 'TestUnsignedFunctionName', {
  value: testUnsigned.functionName,
});