const { messages } = require('elasticio-node');
const request = require('request-promise');
const { refresh } = require('../helper/refreshToken.js');

/**
 * Executes the action's logic by ...
 * The function returns a Promise sending a request and resolving the response as platform message.
 *
 * @param msg incoming messages which is empty for triggers
 * @param cfg object to retrieve triggers configuration values, such as apiKey and pet status
 * @returns promise resolving a message to be emitted to the platform
 */
async function processAction(msg, cfg) {
  const { domain, model, operation } = cfg;
  const { body } = msg;

  const domainId = domain;
  const schemaUri = model;

  // eslint-disable-next-line no-console
  console.log(`My domain: ${JSON.stringify(domainId)}`);
  if (!operation) {
    throw new Error('Operation is required');
  }

  if (!cfg.domain) {
    throw new Error('Domain is required');
  }

  if (!cfg.schema) {
    throw new Error('Model is required');
  }

  const meta = {
    domain: domainId,
    schema: schemaUri,
  };

  const messageWithMeta = {
    meta,
    body,
  };
  const tempToken = 'abc';
  const requestOptions = {
    uri: 'https://ils.openintegrationhub.com/validate',
    method: 'GET',
    json: true,
    header: `Bearer ${tempToken}`,
  };

  const response = await request(requestOptions);

  if (response === 'valid') {
    return messages.newMessageWithBody(messageWithMeta);
  } if (response === 'invalid') {
    throw new Error('Invalid Schema');
  } else {
    throw new Error('Schema not Found');
  }
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
