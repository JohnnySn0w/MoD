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
      id: itemId
    },
    TableName: table
  };

  return dynamo.delete(params).promise();
};

function setUpdateExpression(paramsNames) {
  let expression = `set ${paramsNames[0]} = :0`;
  for (let i = 1; i < paramsNames.length; i++) {
    expression = `${expression}, ${paramsNames[i]} = :${i}`;
  }
  return expression;
}

function setAttribValues(paramsValues) {
  let attribs = {};
  for (let i = 0; i < paramsValues.length; i++) {
    attribs[`:${i}`] = paramsValues[i];
  }
  return attribs;
}


module.exports.updateItem = (itemId, paramsNames, paramsValues, table) => {
  const params = {
    TableName: table,
    Key: {
      id: itemId
    },
    ConditionExpression: 'attribute_exists(id)',
    UpdateExpression: setUpdateExpression(paramsNames),
    ExpressionAttributeValues: setAttribValues(paramsValues),
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
