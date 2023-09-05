const AWS = require('aws-sdk');
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
        return {
            SchemaVersion: '1.0',
            Actions: []
        };
    case 'ACTION_SUCCESSFUL':
      if (event.ActionData && event.ActionData.Type === 'ReceiveDigits') {
        return await handleDigitsReceived(
          event.ActionData,
          event.CallDetails
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
    action,
    callDetails
  ){
    const context = {
      transactionId: callDetails.TransactionId,
      sipRuleId: callDetails.SipRuleId,
      sipMediaApplicationId: callDetails.SipMediaApplicationId
    };
    if (action.ReceivedDigits) {
      const data = {
        PK: `AUTOMATION${action.ReceivedDigits}`,
        SK: Date.now().toString(),
        expiration: '1403040' // Set expiration time
      };
  
      var dynamodb = new AWS.DynamoDB();

    
      dynamodb.putItem(data, function(err, data) {
        if (err) console.log(err, err.stack); 
        else     console.log(data);           
      });
    }
    return {
      SchemaVersion: '1.0',
      Actions: []
    };
  }