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
  const { meta } = msg;

  if (!meta.oihUid) {
    throw new Error('OihUid is required');
  }

  if (!process.env.applicationUid) {
    throw new Error('ApplicationUid is required');
  }

  if (!meta.recordUid) {
    throw new Error('RecordUid is required');
  }

  const linkingObject = {
    oihUid: meta.oihUid,
    applicationUid: process.env.applicationUid,
    recordUid: meta.recordUid,
  };


  const eventName = 'ref.create';
  const transport = new RabbitMqTransport({ rabbitmqUri: config.amqpUrl, logger });
  const eventBus = new EventBus({ transport, logger, serviceName: 'sdf-adapter' });
  await eventBus.subscribe('ref.#', async (event) => {
    // eslint-disable-next-line no-console
    console.log(`Received event: ${JSON.stringify(event)}`);

    await event.ack();
  });
  await eventBus.connect();
  const event = new Event({
    headers: {
      name: eventName,
    },
    payload: linkingObject,
  });

  const result = await eventBus.publish(event);
  // eslint-disable-next-line no-console
  console.log(`Published new message to Eventbus with content ${JSON.stringify(result)}`);

  // eslint-disable-next-line no-console
  console.log(`Send a new message to OIH with content ${JSON.stringify(linkingObject)}`);
}

exports.process = processAction;
