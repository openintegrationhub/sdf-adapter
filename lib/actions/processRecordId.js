const { EventBus, Event, RabbitMqTransport } = require('@openintegrationhub/event-bus');
const bunyan = require('bunyan');

const config = require('../config/index.js');


/**
 * Executes the action's logic by sending the application's recordUid to the Oih for ID Linking
 * The function returns a Promise sending a request and resolving the response as platform message.
 *
 * @param msg incoming messages which is empty for triggers
 * @param cfg object to retrieve triggers configuration values, such as apiKey and pet status
 * @returns promise resolving a message to be emitted to the platform
 */
async function processAction(msg, cfg) {
  const logger = bunyan.createLogger({ name: 'sdf-adapter' });

  const message = msg.body;
  console.log(`Received message with content: ${JSON.stringify(message)}`);
  // Check is needed meta data is set
  if (!message.meta.oihUid) {
    // DELETE THE FOLLOWING LINE AFTER TESTING
    message.meta.oihUid = 1;
    //throw new Error('OihUid is required');
  }

  if (!message.meta.applicationUid) {
    // DELETE THE FOLLOWING LINE AFTER TESTING
    message.meta.applicationUid = 122;
  //  throw new Error('ApplicationUid is required');
  }

  if (!message.meta.recordUid) {
    // DELETE THE FOLLOWING LINE AFTER TESTING
    message.meta.recordUid = 245;
    //throw new Error('RecordUid is required');
  }

  /**  Inititalize object that is later sent to the Open Integration Hub.
   *   The acutal content (data) is already stored in the Data Hub.
   */
  const linkingObject = {
    meta: {
      oihUid: message.meta.oihUid,
      applicationUid: message.meta.applicationUid,
      recordUid: message.meta.recordUid,
    },
    data: {},
  };

  /** In the following lines, the SDF Adapter connects to the event bus and sends
   *  the linking object to the Open Integration Hub via the Event Bus.
   */

  const temp = config.amqpUrl;
  const arr = temp.split('//');
  const beginning = arr[0];
  const tempLoc = arr[1].split('@');
  const loc = tempLoc[1];

  const amqp = `${beginning}//guest:guest@${loc}`;

  const eventName = 'ref.create';
  const transport = new RabbitMqTransport({ rabbitmqUri: amqp, logger });
  const eventBus = new EventBus({ transport, logger, serviceName: 'sdf-adapter' });

  // Subscribe to test if message is propely published
  /* await eventBus.subscribe('ref.#', async (event) => {
    // eslint-disable-next-line no-console
    console.log(`Received event: ${JSON.stringify(event)}`);

    await event.ack();
  }); */

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
