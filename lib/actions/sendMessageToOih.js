/* eslint-disable no-console */
const { EventBus, Event, RabbitMqTransport } = require('@openintegrationhub/event-bus');
const bunyan = require('bunyan');
const _ = require('lodash');
const request = require('request-promise');
const config = require('../config/index.js');

/**
 * Executes the action's logic by ...
 * The function returns a Promise sending a request and resolving the response as platform message.
 *
 * @param msg incoming messages which is empty for triggers
 * @param cfg object to retrieve triggers configuration values, such as apiKey and pet status
 * @returns promise resolving a message to be emitted to the platform
 */
async function processAction(msg, cfg) {
  // Set consts for further message processing
  const logger = bunyan.createLogger({ name: 'sdf-adapter' });
  const { domainId } = msg.body.meta;
  const { schemaUri } = msg.body.meta;
  const { applicationUid } = msg.body.meta;
  const { recordUid } = msg.body.meta;
  const { data } = msg.body;
  const iamToken = process.env.ELASTICIO_IAM_TOKEN;
  const flowId = process.env.ELASTICIO_FLOW_ID;
  const key = 'recordUid';

  // Check if domaindId and schemaUri are given
  if (!domainId) {
    throw new Error('Domain is required');
  }

  if (!schemaUri) {
    throw new Error('Model is required');
  }

  /** Lines 39 to 61 build an object and the realting request options to verify
   * the incoming data via the integration layer service
   *  The validation request is then made in line 80
   */
  const ilsPayload = _.cloneDeep(data);
  console.log(`ilsPayload before: ${JSON.stringify(ilsPayload)}`);
  ilsPayload.recordUid = recordUid;
  console.log(`ilsPayload after: ${JSON.stringify(ilsPayload)}`);

  const ilsReady = {
    ilaId: `${applicationUid}${recordUid}${domainId}`,
    token: iamToken,
    cid: key,
    def: {
      domainId,
      schemaUri,
    },
    payload: ilsPayload,
  };

  const requestOptions = {
    uri: 'http://ils.openintegrationhub.com/chunks/validate',
    method: 'POST',
    json: true,
    header: `Bearer ${iamToken}`,
    body: ilsReady,
  };

  const meta = {
    domainId,
    schemaUri,
    recordUid,
    applicationUid,
    iamToken,
    flowId,
  };

  const messageWithMeta = {
    meta,
    data,
  };

  console.log(`Message with Data: ${JSON.stringify(messageWithMeta)}`);

  const response = await request(requestOptions);

  let eventName = 'validation.failure';

  // Splits the incoming amqp url and sets the correct credentials
  const temp = config.amqpUrl;
  const arr = temp.split('//');
  const beginning = arr[0];
  const tempLoc = arr[1].split('@');
  const loc = tempLoc[1];

  const amqp = `${beginning}//guest:guest@${loc}`;

  /** In the following (L98 - L127) sdf adapter subscribes to events with topic
   * validation.# and builds an eventName based on the validation response.
   * Afterwards the message is built containing meta and data and is then
   * send to the Open Integration Hub via the event bus.
   */
  const transport = new RabbitMqTransport({ rabbitmqUri: amqp, logger });
  const eventBus = new EventBus({ transport, logger, serviceName: 'sdf-adapter' });

  console.log('Printing the response object...');
  console.log(`ILS response object: ${JSON.stringify(response)} ...`);

  if (response.data.valid === true) {
    eventName = 'validation.success';
  } else {
    eventName = 'validation.failure';
  }

  await eventBus.connect();

  const event = new Event({
    headers: {
      name: eventName,
    },
    payload: messageWithMeta,
  });

  console.log(`About to publish a new event to EventBus with message: ${JSON.stringify(event)}`);

  const result = await eventBus.publish(event);

  // eslint-disable-next-line no-console
  console.log(`Published new message to Eventbus with content ${JSON.stringify(result)}`);

  // eslint-disable-next-line no-console
  console.log(`Send a new message to OIH with content ${JSON.stringify(messageWithMeta)}`);
}

exports.process = processAction;
