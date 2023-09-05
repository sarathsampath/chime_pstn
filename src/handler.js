const { UpdateSipMediaApplicationCallCommand, CreateSipMediaApplicationCallCommand } = require('@aws-sdk/client-chime');
const {
    ChimeSDKMeetingsClient,
    CreateMeetingWithAttendeesCommand,
  } = require('@aws-sdk/client-chime-sdk-meetings');
 const chimeClient =  new ChimeSDKMeetingsClient({ region: 'us-east-1' })
export const createMeetingWithAttendees = async (event) => {
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
  };


  export const initiateCall = async(event) => {
    await chimeClient.send(
        new CreateSipMediaApplicationCallCommand({
          FromPhoneNumber: fromPhoneNumber,
          SipMediaApplicationId: sipMediaApplicationId,
          ToPhoneNumber: chimePhoneNumber,
          SipHeaders: {
            'X-chime-meeting-id': MeetingId,
            'X-chime-join-token': JoinToken
          }
        })
      );
  }

  export const sendDtmfDigits  = async(event) => {
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
  }