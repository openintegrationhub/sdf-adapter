/* eslint-disable no-console */
const { EventBus, Event, RabbitMqTransport } = require('@openintegrationhub/event-bus');
const bunyan = require('bunyan');
const { messages } = require('elasticio-node');
const config = require('../config/index.js');

let resultArray = [];

/**
 * Executes the action's logic by ...
 * The function returns a Promise sending a request and resolving the response as platform message.
 *
 * @param msg incoming messages which is empty for triggers
 * @param cfg object to retrieve triggers configuration values, such as apiKey and pet status
 * @returns promise resolving a message to be emitted to the platform
 */
async function processAction(msg, cfg) {
  const logger = bunyan.createLogger({ name: 'sdf-adapter' });
  const { amqpUrl, flowId } = cfg;

  const self = this;

  const transport = new RabbitMqTransport({ rabbitmqUri: amqpUrl, logger });
  const eventBus = new EventBus({ transport, logger, serviceName: 'sdf-adapter' });

  await eventBus.subscribe(`dispatch.${flowId}`, async (event) => {
    // eslint-disable-next-line no-console
    console.log(`Received event: ${JSON.stringify(event)}`);
    resultArray.push(event.payload);
    await event.ack();
  });

  await eventBus.connect();

  console.log(`Result Array Content: ${JSON.stringify(resultArray)}`);

  resultArray.forEach((elem) => {
    console.log(`About to forward message with conent: ${JSON.stringify(elem)}`);
    self.emit('data', messages.newMessageWithBody(elem));
  });

  resultArray = [];
}

exports.process = processAction;
