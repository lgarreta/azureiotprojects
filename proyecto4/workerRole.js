/* Reads device-to-cloud messages from IoT Hub. 
An IoT hub exposes an Event Hubs-compatible endpoint 
to enable you to read device-to-cloud messages. 
*/

'use strict';

var Twitter      = require('twit');
var iothubClient = require('azure-iothub').Client
var evnhubClient = require('azure-event-hubs').Client;
var Message      = require('azure-iot-device').Message;
var fs           = require ('fs');  // To handle files

// Command line parameters
var fileStringEvnhub = process.argv [2]
var fileStringIothub = process.argv [3]

// Connection settings EventHub and IotHub
var stringEvnHub = fs.readFileSync (fileStringEvnhub, 'utf8');
var stringIothub = fs.readFileSync (fileStringIothub, 'utf8');

/* Create the connectionEvnHub, open the connection to your IoT Hub, 
and create a receiver for each partition. This application uses a 
filter when it creates a receiver so that the receiver only reads 
messages sent to IoT Hub after the receiver starts running */

// Connection settings IoT Azure
var connectionEvnHub  = evnhubClient.fromConnectionString (stringEvnHub);
var connectionDevice  = iothubClient.fromConnectionString (stringIothub);

// Connection settings Twitter
var connectionTwitter = new Twitter ({
	consumer_key: '8Fa2005YktGxdz4XNV7hGlkhS',
	consumer_secret: 'I3YHKwjDCvXeWkrs6EdMkb4VDWxvYKpknyw7LDoiMqioGhn7gZ',
	access_token: '767735823135608832-smjaP9T6SzsEYEcXQ8pVwN1MHqFCWEl',
	access_token_secret: 'C0mbYaNTFYxj1M9l2Tj3D57X7wPx3OWcXBwQzacL4iJoL'
});

connectionEvnHub.open()
	.then (connectionEvnHub.getPartitionIds.bind(connectionEvnHub))
	.then (function (partitionIds) {
		return partitionIds.map(function (partitionId) {
			return connectionEvnHub.createReceiver('$Default', partitionId, { 'startAfterTime' : Date.now()})
				.then(function(receiver) {
					console.log('Created partition receiver: ' + partitionId)

					receiver.on ('errorReceived', errorHandler);
					receiver.on ('message', messageHandler);
			});
		});
	}).catch(errorHandler);

// Creates a receiver for each partition

//---------------------------------------------------------
//------------------ Helper functions ---------------------

//---------------------------------------------------------
// MessageHander that sends commands to devices and twitters
//---------------------------------------------------------
var messageHandler = function (message) {
	var jsonMessage = JSON.stringify(message.body);
	var messageValues = JSON.parse (jsonMessage);
	var deviceId = messageValues.DeviceID

	var command = JSON.parse(jsonMessage);
	var newTemperature = command.Temperature - 5;
	var data = JSON.stringify({
		'Name':'SetTemperature',
		'Parameters': {"Temperature": newTemperature }
	});
	
	console.log(">>>> Sending message: " + data);
	connectionDevice.open (function (err) {
		if (err) 
			cosole.log ("Could not connect: " + err);
		else 
			connectionDevice.send (deviceId, data, printResultFor ('send'));
	});

	// Sends tweet
	connectionTwitter.post(
		'statuses/update', 
		{ status: 'Temperature has changed to '+ newTemperature + 'ªC'}, 
		function(err, data, response) {
			console.log(newTemperature)
	});
}
 
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

