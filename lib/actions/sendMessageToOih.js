"use strict";
const co = require('co');
const request = require('request-promise');
const messages = require('elasticio-node').messages;

const API_BASE_URI = 'https://petstore.elastic.io/v2';

exports.process = processAction;
//exports.domains = getDomains;

/**
 * Executes the action's logic by sending a request to the Petstore API and emitting response to the platform.
 * The function returns a Promise sending a request and resolving the response as platform message.
 *
 * @param msg incoming messages which is empty for triggers
 * @param cfg object to retrieve triggers configuration values, such as apiKey and pet status
 * @returns promise resolving a message to be emitted to the platform
 */
function processAction(msg, cfg) {

    const domain = cfg.domain;
    const resource = cfg.resource;
    const operation = cfg.operation;
        
    const body = msg.body;

    if (!domain) {
        throw new Error('Domain is required');
    }

    if (!resource) {
        throw new Error('Resource is required');
    }
    const meta = {
        domain,
        resource,
        operation
    };
    const messageWithMeta = {
        body,
        meta
    }; 

    console.log(`About to send a new message to OIH with content ${JSON.stringify(messageWithMeta)}`);


    return messages.newMessageWithBody(messageWithMeta);
}

/*function getDomains(){
    const token = cfg.token;

    const requestOptions = {
        method: 'GET',
        uri: `http://metadata.openintegrationhub.com/api/v1/domains`,
        json: true,
        headers: {
            "Authorization" : " Bearer " + token, 
            }
    };

    const domains = await request.get(requestOptions);
    confirm.log(`Found the following domains: ${JSON.stringify(domains)}`);
    
    return domains;
}*/