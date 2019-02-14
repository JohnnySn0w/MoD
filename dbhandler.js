'use strict';

const databaseManager = require('./databaseManager');

function createResponse(statusCode, message) {
  return {
    statusCode: statusCode,
    body: JSON.stringify(message)
  };
}

module.exports.saveItem = (item, callback) => {
  console.log('handler received: \n', item);
  databaseManager.saveItem(item).then(response => {
    callback(createResponse(200, response));
  });
};

module.exports.getItem = (itemId, callback) => {
  console.log('handler got: \n', item);
  return databaseManager.getItem(itemId).then(response => {
    callback(createResponse(200, response));
  });
};

module.exports.deleteItem = (itemId, callback) => {
  databaseManager.deleteItem(itemId).then(response => {
    console.log('handler deleted: \n', response);
    callback(createResponse(200, 'Item was deleted'));
  });
};

module.exports.updateItem = (itemInfo, callback) => {
  const itemId = itemInfo.pathParameters.itemId;
  const body = JSON.parse(itemInfo.body);
  const paramName = body.paramName;
  const paramValue = body.paramValue;

  databaseManager.updateItem(itemId, paramName, paramValue).then(response => {
    console.log('handler updated: \n', item);
    callback(createResponse(200, response));
  });
};
