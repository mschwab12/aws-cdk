import { Template, Match } from 'aws-cdk-lib/assertions';
import * as iot from '@aws-cdk/aws-iot-alpha';
import * as oss from 'aws-cdk-lib/aws-opensearchservice';
import * as cdk from 'aws-cdk-lib';
import * as actions from '../../lib';

const IAM_ROLE_ID = 'MyTopicRuleTopicRuleActionRoleCE2D05DA';
const ID = '1234';
const TYPE = 'myType';
const INDEX = 'myIndex';

test('Default opensearch action', () => {
  // GIVEN
  const stack = new cdk.Stack();
  const topicRule = new iot.TopicRule(stack, 'MyTopicRule', {
    sql: iot.IotSql.fromStringAsVer20160323(
      "SELECT topic(2) as device_id FROM 'device/+/data'",
    ),
  });
  const ossDomain = new oss.Domain(stack, 'mydomain', {
    version: oss.EngineVersion.OPENSEARCH_1_3,
  });

  // WHEN
  topicRule.addAction(new actions.OpensearchAction(
    ossDomain,
    ID,
    INDEX,
    TYPE,
  ));

  // THEN
  Template.fromStack(stack).hasResourceProperties('AWS::IoT::TopicRule', {
    TopicRulePayload: {
      Actions: [
        {
          OpenSearch: {
            RoleArn: {
              'Fn::GetAtt': [IAM_ROLE_ID, 'Arn'],
            },
            Endpoint: {
              'Fn::GetAtt': [
                Match.stringLikeRegexp('mydomain'),
                'DomainEndpoint',
              ],
            },
            Id: Match.exact(ID),
            Index: Match.exact(INDEX),
            Type: Match.exact(TYPE),

          },
        },
      ],
    },
  });
});