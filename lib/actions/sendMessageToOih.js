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

  const { domain, model, operation } = cfg;
  const { body } = msg;

  const domainName  = cfg.domain.split('-');
  const modelName  = cfg.model.split('-');

  console.log(`My domain: ${JSON.stringify(domainName)}`);
  if (!operation) {
    throw new Error('Operation is required');
  }

  if (!domain) {
    throw new Error('Domain is required');
  }

  if (!model) {
    throw new Error('Model is required');
  }

  const meta = {
    operation:operation,
    domain:domainName[1],
    model:modelName[1],
  };

  const messageWithMeta = {
    meta,
    body
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

async function getDomains(cfg){
   
  await refresh(cfg);
  const token = process.env.token;

  if(token){
    console.log('Valid token');
  }

  let domainNames= {};

  const requestOptions = {
      method: 'GET',
      uri: `http://metadata.openintegrationhub.com/api/v1/domains`,
      json: true,
      headers: {
          "Authorization" : ` Bearer ${token}`, 
          }
  };

  const domains = await request.get(requestOptions);
     
  domains.data.forEach(element => {
      domainNames[`${element.id}-${element.name}`] = element.name;
      console.log(JSON.stringify(domainNames));
  });
  
  return domainNames;
}

async function getModels(cfg){

  let modelNames= {};
  const tempDomain = cfg.domain.split('-');
  const domain = tempDomain[0];

  await refresh(cfg);
  const token = process.env.token;

  if(token){
    console.log('Valid token');
  }

  const requestOptions = {
    method: 'GET',
    uri: `http://metadata.openintegrationhub.com/api/v1/domains/${domain}/schemas`,
    json: true,
    headers: {
        "Authorization" : ` Bearer ${token}`, 
        }
  };

  const models = await request.get(requestOptions);

  models.data.forEach(element => {
      modelNames[`${element.id}-${element.name}`] = element.name;
      console.log(JSON.stringify(modelNames));
  });
  
  return modelNames;
}

exports.process = processAction;
exports.domains = getDomains;
exports.models = getModels;
