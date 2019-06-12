const { messages } = require('elasticio-node');

/**
 * Executes the action's logic by ...
 * The function returns a Promise sending a request and resolving the response as platform message.
 *
 * @param msg incoming messages which is empty for triggers
 * @param cfg object to retrieve triggers configuration values, such as apiKey and pet status
 * @returns promise resolving a message to be emitted to the platform
 */
function processAction(msg, cfg) {
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

  // eslint-disable-next-line no-console
  console.log(`About to send a new message to OIH with content ${JSON.stringify(messageWithMeta)}`);

  return messages.newMessageWithBody(messageWithMeta);
}

exports.process = processAction;
