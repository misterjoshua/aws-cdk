import * as path from 'path';
import { App, CfnOutput, Stack, StackProps } from '@aws-cdk/core';
import { Construct } from 'constructs';
import * as lambda from '../lib';

/*
 * Stack verification steps:
 * aws lambda invoke --function-name <function name> --invocation-type Event --payload $(base64 <<<'"OK"') response.json
 */

class TestStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const fn = new lambda.PythonFunction(this, 'my_handler', {
      entry: path.join(__dirname, 'lambda-handler-pipenv'),
    });

    new CfnOutput(this, 'FunctionName', {
      value: fn.functionName,
    });
  }
}

const app = new App();
new TestStack(app, 'cdk-integ-lambda-python-inline');
app.synth();
