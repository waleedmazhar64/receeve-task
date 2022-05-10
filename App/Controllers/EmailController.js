const { getSuccessResponse } = require('../helper/success');
const { getErrorResponse } = require('../helper/error');
const { v4: uuidv4 } = require('uuid');
const { EmailModel } = require('../Models/Email');
var AWS = require('aws-sdk');

module.exports = {
    createEmail: function(request, callback){
        try {

            const result = await EmailModel.create({
              id: uuidv4(),
              raw_email: request.body,
              mailgun_timestamp: request.body.signature.timestamp
            });
        
            if(result){
                // Set region
                AWS.config.update({region: process.env.REGION});
                
                var message = {
                    Provider: "Mailgun",
                    timestamp: request.body.signature.timestamp,
                    type: request.body.event-data.event,
                };

                // Create publish parameters
                var params = {
                    Message: JSON.stringify(message),
                    TopicArn: process.env.SNS_TOPIC_ARN
                };
                
                // Create promise and SNS service object
                var publishTextPromise = new AWS.SNS().publish(params).promise();

                publishTextPromise.then(
                    function(data) {
                        callback(getSuccessResponse(data));
                    }).catch(
                      function(error) {
                        return getErrorResponse(error);
                    });
            }
            
          } catch (error) {
            console.log(error);
            return getErrorResponse(error);
          }
    }
};