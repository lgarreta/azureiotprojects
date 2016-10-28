/* Reads device-to-cloud messages from IoT Hub. 
An IoT hub exposes an Event Hubs-compatible endpoint 
to enable you to read device-to-cloud messages. 
*/

'use strict';

var Twitter      = require('twit');
var ClientIH = require('azure-iothub').Client
var ClientEH = require('azure-event-hubs').Client;
var Message      = require('azure-iot-common').Message;
var fs           = require ('fs');  // To handle files

/* Create the clientEvnhub, open the connection to your IoT Hub, 
and create a receiver for each partition. This application uses a 
filter when it creates a receiver so that the receiver only reads 
messages sent to IoT Hub after the receiver starts running */

if (process.argv.length < 4) {
	console.log ("USAGE: node workerRole.js <connstring Event Hub Alarmas> <connstring IotHub>")
	process.exit (0)
}

// values line parameters
var fileStringEvnhub = process.argv [2]
var fileStringIothub = process.argv [3]
// Connection settings EventHub and IotHub
var stringEvnHub = fs.readFileSync (fileStringEvnhub, 'utf8');
var stringIothub = fs.readFileSync (fileStringIothub, 'utf8');
// Connection settings IoT Azure
var clientEvnhub  = ClientEH.fromConnectionString (stringEvnHub);
var clientIothub  = ClientIH.fromConnectionString (stringIothub);

// Connection settings Twitter
var tweeterKeys = fs.readFileSync ("keys-tweeter.json", "utf8")
var keys   = JSON.parse (tweeterKeys)
var connectionTwitter = new Twitter ({
	consumer_key: keys.consumer_key,
	consumer_secret: keys.consumer_secret,
	access_token: keys.access_token,
	access_token_secret: keys.access_token_secret
});

// Stablish conection with the IoTHub and the Event Hub

clientIothub.open (function (err) {
	if (err) 
		console.log ("Could not connect: " + err);
	else 
		console.log ("....Conection stablished with the IoTHub");
});

// Creates a receiver for each partition
clientEvnhub.open()
	.then (clientEvnhub.getPartitionIds.bind (clientEvnhub))
	.then (function (partitionIds) {
		return partitionIds.map(function (partitionId) {
			return clientEvnhub.createReceiver('$Default', partitionId, { 'startAfterTime' : Date.now()})
				.then(function(receiver) {
					console.log('Created partition receiver: ' + partitionId)

					receiver.on ('errorReceived', errorHandler);
					receiver.on ('message', messageHandler);
			});
		});
	}).catch(errorHandler);

//------------------ Callback functions -------------------

//---------------------------------------------------------
// MessageHander that sends commands to devices and twitters
//---------------------------------------------------------
var messageHandler = function (message) {
	var jsonMessage = JSON.stringify(message.body);

	console.log ("<<<< json " + jsonMessage );

	var values = JSON.parse (jsonMessage);
	var newTemperatura = values.Temperatura - 5;
	var deviceId = values.DeviceID;
	console.log ("<<<< " + deviceId );

	var data = JSON.stringify({
		'Name':'SetTemperature',
		'Parameters': {"Temperatura": newTemperatura }
	});

	var message = new Message(data);
	message.ack = 'full';
	message.messageId = 1;
		
	// Sends command to device
	console.log('\n>>> Receiving temperture %d and Sending command to change it to %d ', values.Temperatura, newTemperatura);
	//clientIothub.getFeedbackReceiver (receiveFeedback);
	clientIothub.send (deviceId, data, printResultFor ('send'));


	// Sends tweet to user
	connectionTwitter.post(
		'statuses/update', 
		{ status: 'Temperature has changed to '+ newTemperatura}, 
		function(err, data, response) {
			console.log(">>> Send message to Tweeter");
	});
}

function receiveFeedback(err, receiver){
  receiver.on('message', function (msg) {
    console.log('Feedback message:')
    console.log(msg.getData().toString('utf-8'));
  });
}
 
//------------------ Helper functions ---------------------

//---------------------------------------------------------
// Print output to the console:
//---------------------------------------------------------
var errorHandler = function (err) {
  console.log(err.message);
};

//---------------------------------------------------------
// Print received message
//---------------------------------------------------------
var printReceivedMessage = function (message) {
	console.log('Message received: ');
	console.log(JSON.stringify(message.body));
	console.log('');
};

// Print mensajes fo the object "op"
function printResultFor(op) {
  return function printResult(err, res) {
      if (err) console.log(op + ' error: ' + err.toString());
	  if (res) console.log(op + ' status: ' + res.constructor.name);
  };
}

