'use strict';

const databaseManager = require('./databaseManager');

function createResponse(statusCode, message) {
  return {
    statusCode: statusCode,
    body: JSON.stringify(message)
  };
}

module.exports.saveItem = async (item, table, callback=()=>{}) => {
//   console.log('handler received: \n', item);
  databaseManager.saveItem(item, table).then(response => {
    callback(createResponse(200, response));
  });
};

module.exports.getItem = async (itemId, table, callback=()=>{}) => {
  const response = await databaseManager.getItem(itemId, table);
  callback(createResponse(200, response));
};

//this shouldn't need to be used, if you're updating an entry, use updateItem
module.exports.deleteItem = async (itemId, table, callback=()=>{}) => {
  databaseManager.deleteItem(itemId, table).then(response => {
    callback(createResponse(200, 'Item was deleted', response));
  });
};

module.exports.updateItem = async (itemId, paramName, paramValue, table, callback=()=>{}) => {
  databaseManager.updateItem(itemId, paramName, paramValue, table).then(response => {
    // console.log('handler updated: \n', response);
    callback(createResponse(200, response));
  });
};
