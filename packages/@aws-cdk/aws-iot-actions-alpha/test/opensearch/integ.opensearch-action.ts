import * as iot from '@aws-cdk/aws-iot-alpha';
import * as cdk from 'aws-cdk-lib';
import * as oss from 'aws-cdk-lib/aws-opensearchservice';
import * as actions from '../../lib';
import { IntegTest } from '@aws-cdk/integ-tests-alpha';

const app = new cdk.App();

class TestStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const ossDomain = new oss.Domain(this, 'mydomain', {
      version: oss.EngineVersion.OPENSEARCH_1_3,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      capacity: {
        multiAzWithStandbyEnabled: false,
      },
    });

    const topicRule = new iot.TopicRule(this, 'TopicRule', {
      sql: iot.IotSql.fromStringAsVer20160323(
        "SELECT topic(2) as device_id, year, month, day FROM 'device/+/data'",
      ),
    });

    topicRule.addAction(
      new actions.OpensearchAction(ossDomain, '${newuuid()}', 'my-index', 'my-type'),
    );
  }
}

const stack = new TestStack(app, 'IoTOpensearchActionTestStack');
new IntegTest(app, 'IoTOpensearchAction', {
  testCases: [stack],
});

app.synth();
