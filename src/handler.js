const { UpdateSipMediaApplicationCallCommand, CreateSipMediaApplicationCallCommand } = require('@aws-sdk/client-chime');
const {
  ChimeSDKMeetingsClient,
  CreateMeetingWithAttendeesCommand,
} = require('@aws-sdk/client-chime-sdk-meetings');
const chimeClient = new ChimeSDKMeetingsClient({ region: 'us-east-1' })
const AWS = require('aws-sdk');
AWS.config.update({ region: 'your-dynamodb-region' });
const docClient = new AWS.DynamoDB.DocumentClient();


export const createMeetingWithAttendees = async (event) => {
  try {
    const meetingDetails = await chimeClient.send(
      new CreateMeetingWithAttendeesCommand({
        ClientRequestToken: requestToken, // The unique identifier for the client request
        ExternalMeetingId: externalMeetingId,
        MediaRegion: region, // Media Region
        Attendees: [attendeeDetails], // attendee Details
        NotificationsConfiguration: {
          SqsQueueArn: queueArn // arn of the queue to handle chime meeting events
        }
      })
    );
    console.log(meetingDetails);
    return returnResponse(200,"call initiated",{
      meetingDetails
    })
  }
  catch (err) {
   return returnResponse(400,"Meeting not created",err)
  }

};


/**
 * Params required
 * sipMediaApplicationId -> Id of the sip media application
 * fromPhoneNumber -> SIP rule number
 * MeetingId -> Meeting Id created from createMeetingWith Attendees
 * JoinTOken -> JoinTOken of the meeting
 */
export const initiateCall = async (event) => {
  try{
    const callDetails = await chimeClient.send(
      new CreateSipMediaApplicationCallCommand({
        FromPhoneNumber: fromPhoneNumber,
        SipMediaApplicationId: sipMediaApplicationId,
        ToPhoneNumber: '+17035550122',
        SipHeaders: {
          'X-chime-meeting-id': MeetingId,
          'X-chime-join-token': JoinToken
        }
      })
    );
      return returnResponse(200,"call initiated",{
        transactionId: callDetails.transactionId
      })
  }
  catch(err){
    return returnResponse(400,"Call not initiated",err)
  }
}

/**
 * Params required
 * sipMediaApplicationId -> Id of the sip media application
 * transactionId -> Transaction id of the call
 */
export const sendDtmfDigits = async (event) => {
  try {
    const time = Date.now().toString()
    await chimeClient.send(
      new UpdateSipMediaApplicationCallCommand({
        SipMediaApplicationId: sipMediaApplicationId,
        TransactionId: transactionId,
        Arguments: {
          action: 'sendDtmf',
          digits: '123'
        }
      })
    );
    return returnResponse(200,"Digits sent to the receiver",{
      digits: "123",
      time
    })
  }
  catch (err) {
    return returnResponse(400,"Digits not sent",err)
  }

}
/**
 * Params required
 * time -> Time when the digits sent
 * dtmfDigits -> Digit to validate
 */
export const verifyDtmfDigits = async (event) => {
  try{
    const params = {
      TableName: tableName,
      KeyConditionExpression: '#dtmf= :dtmfValue AND #SK > :SKValue',
      ExpressionAttributeValues: {
        ':SKValue': time,
        ':dtmfValue': `AUTOMATION${dtmfDigits}`
      },
      ExpressionAttributeNames: {
        '#dtmf': 'PK',
        '#SK': 'SK'
      }
    }
    const dtmfQurey = docClient.query(params, function (err, data) {
      if (err) console.log(err, err.stack);
      else console.log(data);
    });
    if(dtmfQurey.Items.length > 0 )
      return returnResponse(200,"Digits received",{})
    else 
      throw new Error("Digits not recived at receiver end")
  }
  catch(err){
    return returnResponse(400,"Digits not received",err)
  }
}

function returnResponse(statusCode,message,err){
  return {
    statusCode: statusCode,
    body: JSON.stringify({
      statusCode: statusCode,
      message: message,
      details: err
    })
  };
}