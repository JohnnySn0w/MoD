'use strict';

const databaseManager = require('./databaseManager');

function createResponse(statusCode, message) {
  return {
    statusCode: statusCode,
    body: JSON.stringify(message)
  };
}

module.exports.saveItem = (item, table, callback) => {
  console.log('handler received: \n', item);
  databaseManager.saveItem(item, table).then(response => {
    callback(createResponse(200, response));
  });
};

module.exports.getItem = (itemId, table, callback) => {
  return databaseManager.getItem(itemId, table).then(response => {
    callback(createResponse(200, response));
  });
};

//this shouldn't need to be used, if you're updating an entry, use updateItem
module.exports.deleteItem = (itemId, table, callback) => {
  databaseManager.deleteItem(itemId, table).then(response => {
    console.log('handler deleted: \n', response);
    callback(createResponse(200, 'Item was deleted'));
  });
};

module.exports.updateItem = (itemInfo, table, callback) => {
  const itemId = itemInfo.pathParameters.itemId;
  const body = JSON.parse(itemInfo.body);
  const paramName = body.paramName;
  const paramValue = body.paramValue;

  databaseManager.updateItem(itemId, paramName, paramValue, table).then(response => {
    // console.log('handler updated: \n', item);
    callback(createResponse(200, response));
  });
};
