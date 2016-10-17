'use strict';
var Client = require('azure-iothub').Client;
//var Message = require('azure-iot-common').Message;
var Message = require('azure-iot-device').Message;
var fs  = require ("fs");

var message = new Message('hello');
message.messageId = 'unique-message-id';
message.ack = 'full';

// ------------ Handlers --------------
function openedConnectionHandler (err) {
  console.log ("Opened conection");
  if (err) 
  	handleErrorAndExit(err);

  client.getFeedbackReceiver(function (err, receiver) {
    if (err) handleErrorAndExit(err);
    receiver.on('errorReceived', function (err) {
      handleErrorAndExit(err);
    });
    receiver.on('message', function (feedback) {
      console.log(feedback.body);
      client.close();
    });
  });
  client.send('dev00', message, function (err) {
    if (err) handleErrorAndExit(err);
	else console.log (">>> Message sent"); 
  });
}

// Main
var connectionString = fs.readFileSync ('connstr-iothub.txt', 'utf8');
var client = Client.fromConnectionString (connectionString);
client.open (openedConnectionHandler);
