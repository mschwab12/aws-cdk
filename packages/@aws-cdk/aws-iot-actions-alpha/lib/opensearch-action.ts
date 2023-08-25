import * as iot from '@aws-cdk/aws-iot-alpha';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as oss from 'aws-cdk-lib/aws-opensearchservice';
import { CommonActionProps } from './common-action-props';
import { singletonActionRole } from './private/role';

/**
 * Configuration properties of an action for Opensearch Service domain.
 */
export interface OpensearchActionProps extends CommonActionProps {
}

/**
 * The action to send data from an MQTT message to an Amazon OpenSearch Service domain.
 */
export class OpensearchAction implements iot.IAction {
  private readonly role?: iam.IRole;
  private readonly domain: oss.Domain;
  private readonly id: string;
  private readonly index: string;
  private readonly type: string;

  /**
   * @param domain The OpenSeadomain.
   * @param id The unique identifier for the document you are storing.
   * @param index The OpenSearch index where you want to store your data.
   * @param type The type of document you are storing.
   * @param props Optional properties to not use default
   */
  constructor(
    domain: oss.Domain,
    id: string,
    index: string,
    type: string,
    props: OpensearchActionProps = {},
  ) {
    this.domain = domain;
    this.id = id;
    this.index = index;
    this.type = type;
    this.role = props.role;
  }

  /**
   * @internal
   */
  _bind(topicRule: iot.ITopicRule): iot.ActionConfig {
    const role = this.role ?? singletonActionRole(topicRule);

    return {
      configuration: {
        openSearch: {
          endpoint: this.domain.domainEndpoint,
          index: this.index,
          type: this.type,
          id: this.id,
          roleArn: role.roleArn,
        },
      },
    };
  }
}