import { Match, Template } from '@aws-cdk/assertions';
import { HttpApi, IHttpRouteIntegration, HttpRouteIntegrationBindOptions, PayloadFormatVersion, HttpIntegrationType } from '@aws-cdk/aws-apigatewayv2';
import { Stack } from '@aws-cdk/core';
import { HttpIamAuthorizer } from '../../lib/http/iam';

describe('HttpIamAuthorizer', () => {
  test('default', () => {
    // GIVEN
    const stack = new Stack();
    const api = new HttpApi(stack, 'HttpApi');

    const authorizer = new HttpIamAuthorizer();

    // WHEN
    api.addRoutes({
      integration: new DummyRouteIntegration(),
      path: '/books',
      authorizer,
    });

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::ApiGatewayV2::Route', Match.objectLike({
      AuthorizationType: 'AWS_IAM',
      AuthorizerId: Match.absent(),
    }));
  });

  test('default integration', () => {
    // GIVEN
    const stack = new Stack();
    const authorizer = new HttpIamAuthorizer();

    // WHEN
    new HttpApi(stack, 'HttpApi', {
      defaultAuthorizer: authorizer,
      defaultIntegration: new DummyRouteIntegration(),
    });

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::ApiGatewayV2::Route', Match.objectLike({
      AuthorizationType: 'AWS_IAM',
      AuthorizerId: Match.absent(),
    }));
  });
});


class DummyRouteIntegration implements IHttpRouteIntegration {
  public bind(_: HttpRouteIntegrationBindOptions) {
    return {
      payloadFormatVersion: PayloadFormatVersion.VERSION_2_0,
      type: HttpIntegrationType.HTTP_PROXY,
      uri: 'some-uri',
    };
  }
}
