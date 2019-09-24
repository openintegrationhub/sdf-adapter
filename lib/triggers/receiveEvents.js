/* eslint-disable no-console */
const { EventBus, Event, RabbitMqTransport } = require('@openintegrationhub/event-bus');
const { messages } = require('elasticio-node');
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
  console.log(`msg = ${JSON.stringify(msg)}`);
  const logger = bunyan.createLogger({ name: 'sdf-adapter' });
  const self = this;
  const flowId = process.env.ELASTICIO_FLOW_ID;
  const message = msg;

  if (!message.meta.domain) {
    throw new Error('Domain is required');
  }

  if (!message.meta.model) {
    throw new Error('Model is required');
  }

  const temp = config.amqpUrl;
  const arr = temp.split('//');
  const beginning = arr[0];
  const tempLoc = arr[1].split('@');
  const loc = tempLoc[1];
  let eventMessage = {};

  const amqp = `${beginning}//guest:guest@${loc}`;

  const transport = new RabbitMqTransport({ rabbitmqUri: amqp, logger });
  const eventBus = new EventBus({ transport, logger, serviceName: 'sdf-adapter' });

  await eventBus.subscribe(`dispatch.${flowId}`, async (event) => {
    // eslint-disable-next-line no-console
    console.log(`Received event: ${JSON.stringify(event)}`);
    eventMessage = event;
    await event.ack();
  });

  await eventBus.connect();

  console.log(`About to forward message with conent: ${eventMessage}`);

  self.emit('data', messages.newMessageWithBody(eventMessage));
}

exports.process = processAction;

processAction('hello', 'fresh');
