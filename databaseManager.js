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

const TABLE_NAME = process.env.ENTITIES_DYNAMODB_TABLE;

module.exports.initializateDynamoClient = newDynamo => {
  dynamo = newDynamo;
};

module.exports.saveItem = item => {
  const params = {
    TableName: TABLE_NAME,
    Item: item
  };

  return dynamo.put(params).promise().then(() => {
    return item.itemId;
  });
};

module.exports.getItem = itemId => {
  const params = {
    Key: {
      itemId: itemId
    },
    TableName: TABLE_NAME
  };

  return dynamo.get(params).promise().then(result => {
    return result.Item;
  });
};

module.exports.deleteItem = itemId => {
  const params = {
    Key: {
      itemId: itemId
    },
    TableName: TABLE_NAME
  };

  return dynamo.delete(params).promise();
};

module.exports.updateItem = (itemId, paramsName, paramsValue) => {
  const params = {
    TableName: TABLE_NAME,
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
  });
};
