/* eslint-disable no-console */
const { EventBus, Event, RabbitMqTransport } = require('@openintegrationhub/event-bus');
const bunyan = require('bunyan');
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
  const logger = bunyan.createLogger({ name: 'test' });

  const message = msg;
  if (!message.meta.domain) {
    throw new Error('Domain is required');
  }

  if (!message.meta.model) {
    throw new Error('Model is required');
  }

  const domainId = message.meta.domain;
  const schemaUri = message.meta.model;
  const { applicationUid } = message.meta;
  const { recordUid } = message.meta;
  const { data } = message;
  const { iamToken } = message.meta;
  const key = 'oihUid';

  const ilsReady = {
    ilaId: `${applicationUid}${recordUid}${domainId}`,
    token: iamToken,
    cid: key,
    def: {
      domainId,
      schemaUri,
    },
    payload: data,
  };

  const requestOptions = {
    uri: 'http://ils.openintegrationhub.com/chunks/validate',
    method: 'POST',
    json: true,
    header: `Bearer ${iamToken}`,
    body: ilsReady,
  };

  const meta = {
    domain: domainId,
    model: schemaUri,
    domainId,
    schemaUri,
    recordUid,
    applicationUid,
    iamToken,
  };

  const messageWithMeta = {
    meta,
    data,
  };

  const response = await request(requestOptions);

  let eventName = 'validation.failure';

  const transport = new RabbitMqTransport({ rabbitmqUri: config.amqpUrl, logger });
  const eventBus = new EventBus({ transport, logger, serviceName: 'sdf-adapter' });

  await eventBus.subscribe('validation.#', async (event) => {
    // eslint-disable-next-line no-console
    console.log(`Received event: ${JSON.stringify(event)}`);
    await event.ack();
  });

  // res.body.validation as placeholder. Value needs to be fixed once ILS introduced validation.
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

  const result = await eventBus.publish(event);
  // eslint-disable-next-line no-console
  console.log(`Published new message to Eventbus with content ${JSON.stringify(result)}`);

  // eslint-disable-next-line no-console
  console.log(`Send a new message to OIH with content ${JSON.stringify(messageWithMeta)}`);
}

exports.process = processAction;
