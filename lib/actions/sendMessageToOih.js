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
  console.log(`msg = ${JSON.stringify(msg)}`);
  const logger = bunyan.createLogger({ name: 'sdf-adapter' });
  const domainId = msg.body.meta.domain;
  const schemaUri = msg.body.meta.model;
  const { applicationUid } = msg.body.meta;
  const { recordUid } = msg.body.meta;
  const { data } = msg.body;
  const iamToken = process.env.ELASTICIO_IAM_TOKEN;
  const flowId = process.env.ELASTICIO_FLOW_ID;
  const key = 'oihUid';

  const message = msg.body;

  if (!message.meta.domain) {
    throw new Error('Domain is required');
  }

  if (!message.meta.model) {
    throw new Error('Model is required');
  }

  const ilsPayload = data;
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


  const temp = config.amqpUrl;
  const arr = temp.split('//');
  const beginning = arr[0];
  const tempLoc = arr[1].split('@');
  const loc = tempLoc[1];

  const amqp = `${beginning}//guest:guest@${loc}`;

  const transport = new RabbitMqTransport({ rabbitmqUri: amqp, logger });
  const eventBus = new EventBus({ transport, logger, serviceName: 'sdf-adapter' });

  await eventBus.subscribe('validation.#', async (event) => {
    // eslint-disable-next-line no-console
    console.log(`Received event: ${JSON.stringify(event)}`);
    await event.ack();
  });

  console.log('Printing the response object...');
  console.log(`ILS response object: ${JSON.stringify(response)} ...`);

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

  console.log(`About to publish a new event to EventBus with message: ${JSON.stringify(event)}`);

  const result = await eventBus.publish(event);
  // eslint-disable-next-line no-console
  console.log(`Published new message to Eventbus with content ${JSON.stringify(result)}`);

  // eslint-disable-next-line no-console
  console.log(`Send a new message to OIH with content ${JSON.stringify(messageWithMeta)}`);


  /*
  const test = {
    meta: {
      domain: '5d70e69c936f980011698a85',
      model: '/collaboration/task.json',
      recordUid: 'xkwe12523',
      applicationUid: '123',
      iamToken: 'U8Mk3aagmeGusR8bBsZMyOP62QNP7oSQIp5ZpyDPUK2-Jsvce3dBqMcpd7SVmRmMCpiQ
      yxikdKAsUgFPmbiQykAu0gxcEKaadxhSNcbjFpEld45R1OxJJ1mHMqdYyFEFl68XyVVahmO-bhBGnP
      hnJQqVdYnNc-12G8VesSWwizI',
    },
    data: {
      oihUid: '567',
      oihApplicationRecords: [
        {
          applicationUid: '123',
          recordUid: '201306',
        },
      ],
      substasks: [
        {
          task: 'Analyze system 1',
          details: {
            subject: 'analysis',
            startdate: '2018-01-01T10:10:10Z',
            enddate: '2018-03-01T10:10:10Z',
            reminderdate: '2018-02-01T10:10:10Z',
            content: 'To create a datamodel we have to analyze system 1...',
            status: 'in progress',
          },
        },
        {
          task: 'Analyze system 2',
          details: {
            subject: 'analysis',
            startdate: '2018-01-01T10:10:10Z',
            enddate: '2018-03-01T10:10:10Z',
            reminderdate: '2018-02-01T10:10:10Z',
            content: 'To create a datamodel we have to analyze system 2...',
            status: 'in progress',
          },
        },
      ],
      details: {
        task: 'Analyze systems',
        details: {
          subject: 'analysis',
          startdate: '2018-01-01T10:10:10Z',
          enddate: '2018-03-01T10:10:10Z',
          reminderdate: '2018-02-01T10:10:10Z',
          content: 'To create a datamodel we have to analyze system 1...',
          status: 'in progress',
        },
      },
    },
  }; */
}

exports.process = processAction;

processAction('hello', 'fresh');
