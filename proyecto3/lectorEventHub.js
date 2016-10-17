/* Reads device-to-cloud messages from IoT Hub. 
An IoT hub exposes an Event Hubs-compatible endpoint 
to enable you to read device-to-cloud messages. 
*/

'use strict';
var EventHubClient = require('azure-event-hubs').Client;
var fs      = require ('fs');

// Command line parameters
var fileEvnHubString = process.argv [2]

// Connection settings
var connectionString = fs.readFileSync (fileEvnHubString, 'utf8');
console.log ("IoT Hub: " + connectionString);

// Print output to the console:
var printError = function (err) {
  console.log(err.message);
};
var printMessage = function (message) {
	console.log('Message received: ');
	console.log(JSON.stringify(message.body));
	console.log('');
};

/* Create the EventHubClient, open the connection to your 
IoT Hub, and create a receiver for each partition. This 
application uses a filter when it creates a receiver so 
that the receiver only reads messages sent to IoT Hub after 
the receiver starts running */

var client = EventHubClient.fromConnectionString(connectionString);

client.open()
	.then (client.getPartitionIds.bind(client))
	.then (handleAllPartitions)
	.catch (printError);

// Creates a receiver for each partition
function handleAllPartitions (partitionIds) {
	return partitionIds.map (createReceiver);
}

function createReceiver (partitionId) {
	return client.createReceiver(
		'$Default', 
		partitionId, 
		{'startAfterTime' : Date.now()})
	.then (handleReceiver);
}

function handleReceiver (receiver, partitionId) {
	console.log('Created partition receiver: ' + partitionId)
	receiver.on('errorReceived', printError);
	receiver.on('message', printMessage);
}
