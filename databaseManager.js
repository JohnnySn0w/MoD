'use strict';

const AWS = require('aws-sdk');
const AWSaccessKeyId = 'not-important';
const AWSsecretAccessKey = 'not-important';      
const AWSregion = 'local';
const AWSendpoint = 'http://localhost:8000'; // This is required
AWS.config.update({
  accessKeyId: AWSaccessKeyId,
  secretAccessKey: AWSsecretAccessKey,  
  region: AWSregion,
  endpoint: AWSendpoint
});

let dynamo = new AWS.DynamoDB.DocumentClient();

/* 
  commented out previous entry as it wasn't working, also 
  we likely don't need a prod vs a dev
*/
// const TABLE_NAME = process.env.ENTITIES_DYNAMODB_TABLE;
// const TABLE_NAME = 'MoD-entities-dev';

module.exports.initializateDynamoClient = newDynamo => {
  dynamo = newDynamo;
};

module.exports.saveItem = (item, table) => {
  const params = {
    TableName: table,
    Item: item
  };

  return dynamo.put(params).promise().then(() => {
    return item.itemId;
  })
    .catch((oof) => 
    {
      console.error(oof);
      return oof.statusCode;
    });
};

module.exports.getItem = (itemId, table) => {
  const params = {
    Key: {
      id: itemId
    },
    TableName: table
  };

  return dynamo.get(params).promise().then(result => {
    return result;
  })
    .catch((oof) => 
    {
      console.error('ERROR:', oof);
      return oof.statusCode;
    });
};

//this shouldn't need to be used, if you're updating an entry, use updateItem
module.exports.deleteItem = (itemId, table) => {
  const params = {
    Key: {
      itemId: itemId
    },
    TableName: table
  };

  return dynamo.delete(params).promise();
};

module.exports.updateItem = (itemId, paramsName, paramsValue, table) => {
  const params = {
    TableName: table,
    Key: {
      itemId
    },
    ConditionExpression: 'attribute_exists(itemId)',
    UpdateExpression: 'set ' + paramsName + ' = :v',
    ExpressionAttributeValues: {
      ':v': paramsValue
    },
    ReturnValues: 'ALL_NEW'
  };

  return dynamo.update(params).promise().then(response => {
    return response.Attributes;
  })
    .catch((oof) => 
    {
      console.error(oof);
      return oof.statusCode;
    });
};
