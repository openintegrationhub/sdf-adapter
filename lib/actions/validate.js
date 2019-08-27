const { messages } = require('elasticio-node');
const request = require('request-promise');
const { EventBus, Event, RabbitMqTransport } = require('@openintegrationhub/event-bus');
const bunyan = require('bunyan');

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
  const { body } = msg;

  if (!body.meta.domain) {
    throw new Error('Domain is required');
  }

  if (!body.meta.model) {
    throw new Error('Model is required');
  }

  const domainId = body.meta.domain;
  const schemaUri = body.meta.model;
  const { payload } = body;

  const meta = {
    domain: domainId,
    schema: schemaUri,
  };

  const messageWithMeta = {
    meta,
    payload,
  };
  const tempToken = token;

  const requestOptions = {
    uri: 'https://ils.openintegrationhub.com/validate',
    method: 'POST',
    json: true,
    header: `Bearer ${tempToken}`,
  };

  await request(requestOptions, async (res) => {
    let eventName = 'validation.failure';
    const transport = new RabbitMqTransport({ rabbitmqUri: config.amqpUrl, logger });
    const eventBus = new EventBus({ transport, logger, serviceName: 'sdf-adapter' });
    await eventBus.subscribe('validation.#', async (event) => {
      // eslint-disable-next-line no-console
      console.log(`Received event: ${JSON.stringify(event)}`);
      await event.ack();
    });

    if (res === 'valid') {
      eventName = 'validation.success';
    } else {
      eventName = 'validation.failure';
    }

    await eventBus.connect();
    const event = new Event({
      headers: {
        name: eventName,
      },
      payload: res,
    });

    const result = await eventBus.publish(event);
    // eslint-disable-next-line no-console
    console.log(`Published new message to Eventbus with content ${JSON.stringify(result)}`);

    // eslint-disable-next-line no-console
    console.log(`Send a new message to OIH with content ${JSON.stringify(linkingObject)}`);

    if (res === 'valid') {
      const eventName = 'linking.response';

      return messages.newMessageWithBody(messageWithMeta);
    } if (res === 'invalid') {
      throw new Error('Provided data is invalid');
    } else {
      throw new Error('Schema not Found');
    }
  });
}

async function getDomains(cfg) {
  await refresh(cfg);
  const { token } = process.env;

  if (token) {
    // eslint-disable-next-line no-console
    console.log('Valid token');
  }

  const domainNames = {};

  const requestOptions = {
    method: 'GET',
    uri: 'http://metadata.openintegrationhub.com/api/v1/domains',
    json: true,
    headers: {
      Authorization: ` Bearer ${token}`,
    },
  };

  const domains = await request.get(requestOptions);

  domains.data.forEach((element) => {
    domainNames[`${element.id}-${element.name}`] = element.name;
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(domainNames));
  });

  return domainNames;
}

async function getModels(cfg) {
  const modelNames = {};
  const tempDomain = cfg.domain.split('-');
  const domain = tempDomain[0];

  await refresh(cfg);
  const { token } = process.env.token;

  if (token) {
    // eslint-disable-next-line no-console
    console.log('Valid token');
  }

  const requestOptions = {
    method: 'GET',
    uri: `http://metadata.openintegrationhub.com/api/v1/domains/${domain}/schemas`,
    json: true,
    headers: {
      Authorization: ` Bearer ${token}`,
    },
  };

  const models = await request.get(requestOptions);

  models.data.forEach((element) => {
    modelNames[`${element.id}-${element.name}`] = element.name;
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(modelNames));
  });
  return modelNames;
}

exports.process = processAction;
exports.domains = getDomains;
exports.models = getModels;
