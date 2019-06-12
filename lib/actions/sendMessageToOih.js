const { messages } = require('elasticio-node');
const { EventBus, Event, RabbitMqTransport } = require('@openintegrationhub/event-bus');
const bunyan = require('bunyan');


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

  const { domain, resource, operation } = cfg;
  const { body } = msg;

  if (!domain) {
    throw new Error('Domain is required');
  }

  if (!resource) {
    throw new Error('Resource is required');
  }
  const meta = {
    domain,
    resource,
    operation,
  };
  const messageWithMeta = {
    body,
    meta,
  };

  const transport = new RabbitMqTransport({ rabbitmqUri: 'amqp://guest:guest@localhost:5672', logger });
  const eventBus = new EventBus({ transport, logger, serviceName: 'my-service' });
  await eventBus.connect();
  const event = new Event({
    headers: {
      name: 'flow.started',
    },
    payload: messageWithMeta,
  });

  const result = await eventBus.publish(event);
  console.log(`Published new message to Eventbus with content ${JSON.stringify(result)}`);

  console.log(`Send a new message to OIH with content ${JSON.stringify(messageWithMeta)}`);
  return messages.newMessageWithBody(messageWithMeta);
}

exports.process = processAction;
