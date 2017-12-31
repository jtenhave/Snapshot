/**
 * This module will listen for PVR multicast packets that broadcast
 * information about what is being played on the PVR. The information
 * is sent to the web app using a web socket.
 * 
 * Note: Hopefully one day this will not be required.
 * Chrome does not support this API yet: 
 * https://www.w3.org/TR/tcp-udp-sockets/
 */

var dgram = require('dgram');
var http = require('http');
var WebSocketServer = require('websocket').server;
var xml2js = require('xml2js-parser');

const PORT = 8082;
const HOST = '239.255.255.250';

const requestLine = "NOTIFY * HTTP/1.1\r\n";
const headerRegex = /x-(\w+):\s(\w+)(\r\n)?/g;
const tuneSrcRegex = /http:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{3,5}\/dvrfs\/v\d{1,5}/g;
const timeRegex = /(0x[\dabcdef]{8})[\dabcdef]{8}/;
const epoch = new Date(Date.UTC(1900, 0, 1, 0, 0, 0));
let connectionCount = 0;
const connections = {};

// Setup web socket
var server = http.createServer();
server.listen(8080, () => {
    console.log('Websocket server is listening on port 8080');
});

wsServer = new WebSocketServer({
    httpServer: server
});

wsServer.on('request', r => {
    const connection = r.accept("pvr-sync", r.origin);
	console.log('Client ' + connection.remoteAddress + ' connected.');
	const id = connectionCount++;
	connections[id] = connection;

	connection.on('close', (reasonCode, description) => {
		delete connections[id];
		console.log('Client ' + connection.remoteAddress + ' disconnected.');
	});
});

// Setup listener for PVR multicast packets
const client = dgram.createSocket('udp4');
client.on('listening', function () {
    const address = client.address();
    console.log('Listening for PVR data on: ' + address.address + ":" + address.port); 
    client.addMembership(HOST);
});
client.on('message', handleMessage);
client.bind(PORT); // Linux: client.bind(PORT, HOST);

/**
 * Handle multicast packet.
 */
async function handleMessage(message, remote) {
	let content = message.toString();
	const headerIndex = content.indexOf(requestLine);
	if (headerIndex < 0) {
		return;
	}

	content = content.substring(headerIndex + requestLine.length);
	
	const packetParts = content.split("\r\n\r\n");
	if (packetParts.length !== 2) {
		return;
	}
	
	const headers = parseHeaders(packetParts[0]);
	if (!headers.some(function(h) { return h[0] === "type" && h[1] === "dvr" })) {
		return;
	}

    // Note: This does not seem to support promises as indicated in documentation.
	xml2js.parseString(packetParts[1], (err, result) => {
		if (err) {
			console.log('Error parsing DVR packet: ' + err);
			return;
        }
        
        const date = parseMessage(result);
		if (date) {
			console.log('Message from: ' + remote.address + ':' + remote.port + ' ' + date.toString());
            // Broadcast data on the web socket.
            Object.keys(connections).forEach(id => {
                const client = connections[id];
                console.log("Notifying " + client.remoteAddress);
                client.sendUTF(date.getTime().toString());
            });
		}
	});
}

/**
 * Parse the packet header.
 */
function parseHeaders(body) {
	let match;
	const results = [];
	while (match = headerRegex.exec(body)) {
		results.push([match[1], match[2]]);
	}

	return results;
}

/**
 * Parse the packet body. 
 */
function parseMessage(message) {
	if (message.node && message.node.activities && message.node.activities[0].tune) {
        const tunes = message.node.activities[0].tune;
        for (const tune of tunes) {
            if (tune.$ && tune.$.src && tune.$.src.match(tuneSrcRegex) && tune.$.ct) {
				const match = tune.$.ct.match(timeRegex);
				if (match && match[1] !== '0xffffffff') {
					const ts = parseInt(match[1]) * 1000;
					return new Date(epoch.getTime() + ts);
				}
			}
        }
	}
}
