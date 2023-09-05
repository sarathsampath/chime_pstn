const { DeleteMessageCommand, SQSClient } = require('@aws-sdk/client-sqs');
const { UpdateSipMediaApplicationCallCommand } = require('@aws-sdk/client-chime');


const sqs = new SQSClient({ region: region });

// noinspection JSUnusedGlobalSymbols
export const lambdaHandler = async (events) => {
  for (const event of events.Records) {
    console.log('Processing SQS Event', { data: event });
    try {
      const chimeEvent = JSON.parse(event.body);
      switch (chimeEvent['detail']['eventType']) {
        case 'chime:AttendeeJoined':
          console.log('chimeEvent - chime:AttendeeJoined');
          new UpdateSipMediaApplicationCallCommand({
            SipMediaApplicationId: sipMediaApplicationId,
            TransactionId: transactionId,
            Arguments: {
              action: 'callAndBridge'
            }
          })
          
          break; 
        case 'chime:AttendeeLeft':
          console.log('chimeEvent - chime:AttendeeLeft');
          break;

        case 'chime:AttendeeDropped':
          console.log('chimeEvent - chime:AttendeeDropped');
          break;

        case 'chime:AttendeeDeleted':
          console.log('chimeEvent - chime:AttendeeDropped');
          break;

        case 'chime:MeetingEnded':
          console.log('chimeEvent - chime:MeetingEnded');
          break;

        default:
          console.log('Received Unhandled Chime Event', { chimeEvent });
      }
    } catch (error) {
      Logger.error('Error occurred', {
        err: error,
        event: event
      });
    } finally {
      await sqs.send(
        new DeleteMessageCommand({
          QueueUrl: sqsQueueUrl,
          ReceiptHandle: event.receiptHandle
        })
      );
    }
  }
};
