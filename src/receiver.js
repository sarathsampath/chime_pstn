const AWS = require('aws-sdk');

// Configure AWS SDK (Make sure your AWS credentials are properly set up)
AWS.config.update({ region: 'your-dynamodb-region' });

// noinspection JSUnusedGlobalSymbols
export const lambdaHandler = async (event) => {

  switch (event.InvocationEventType) {
    case 'NEW_INBOUND_CALL':
        console.log('NEW_INBOUND_CALL');
        return {
            SchemaVersion: '1.0',
            Actions: []
        };
    case 'DIGITS_RECEIVED':
        return await handleDigitsReceived(
          event.ActionData
        );
    case 'ACTION_SUCCESSFUL':
      if (event.ActionData && event.ActionData.Type === 'ReceiveDigits') {
        return await handleDigitsReceived(
          event.ActionData
        );
      } else {
        console.log('Unhandled ACTION_SUCCESSFUL event type', { event });
        return {
          SchemaVersion: '1.0',
          Actions: []
        };
      }
    case 'HANGUP':
      return handleHangup();
    default:
      console.log('Unhandled SMA event', { event });
      return {
        SchemaVersion: '1.0',
        Actions: []
      };
  }
};

async function handleDigitsReceived(
    action
  ){
    if (action.ReceivedDigits) {
      const params = {
        TableName: tableName,
        Item:{
        PK: `AUTOMATION${action.ReceivedDigits}`,
        SK: Date.now().toString(),
        expiration: '1403040' // Set expiration time
        }
      };
  
      const docClient = new AWS.DynamoDB.DocumentClient();
      docClient.putItem(params, function(err, data) {
        if (err) console.log(err, err.stack); 
        else     console.log(data);           
      });
    }
    return {
      SchemaVersion: '1.0',
      Actions: []
    };
  }