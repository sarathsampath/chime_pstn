
  // noinspection JSUnusedGlobalSymbols
  export const lambdaHandler = async (event) => {
    switch (event.InvocationEventType) {
        case 'NEW_OUTBOUND_CALL':
            return {
                SchemaVersion: '1.0',
                Actions: []
                };

        case 'ACTION_SUCCESSFUL':
            console.log("ACTION_SUCCESSFUL");  
            return {
                SchemaVersion: '1.0',
                Actions: []
                };

        case 'CALL_UPDATE_REQUESTED':
            console.log("CALL_UPDATE_REQUESTED");  
            if(event.actionData.type  == 'callAndBridge'){
                return {
                  Type: 'CallAndBridge',
                  Parameters: {
                    CallTimeoutSeconds: 30,
                    CallerIdNumber: fromNumber,
                    EarlyMediaMode: 'ENABLE',
                    Endpoints: [
                      {
                        BridgeEndpointType: 'PSTN',
                        Uri: toNumber
                      }
                    ]
                  }
                };
            }
            else if(event.actionData.type  == 'sendDtmf'){
                return {
                    SchemaVersion: '1.0',
                    Actions: [
                      {
                        Type: 'SendDigits',
                        Parameters: {
                          CallId: CallId,
                          Digits: '123'
                        }
                      }
                    ]
                  };
            }
            else{
                return {
                    SchemaVersion: '1.0',
                    Actions
                }
            }

        case 'HANGUP':
            return {
                SchemaVersion: '1.0',
                Actions: []
                };

        default:
            return {
            SchemaVersion: '1.0',
            Actions: []
            };
    }
};
