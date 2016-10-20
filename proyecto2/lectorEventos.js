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

// Listen messages from the partition
function createReceiver (partitionId) {
	return client.createReceiver(
		'$Default', 
		partitionId, 
		{'startAfterTime' : Date.now()})
	.then (function(receiver) {
		console.log('Created partition receiver: ' + partitionId)
		receiver.on('errorReceived', printError);
		receiver.on('message', printMessage);
	});
}

//---------------------------------------------------------
//------------------ Helper functions ---------------------
//---------------------------------------------------------

// Print error output to the console
function printError (err) {
  console.log(err.message);
}

// Print message body to the console
function printMessage  (message) {
	console.log('Message received: ');
	console.log(JSON.stringify(message.body));
	console.log('');
}


