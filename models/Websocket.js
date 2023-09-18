// Websocket.js

// Based on this example: https://medium.com/@martin.sikora/node-js-websocket-simple-chat-tutorial-2def3a841b61

class ClientSession {
    constructor(conn, id) {
        this.id = id;
        this.connection = conn;
    }
}

var CLIENTS = [];

var webSocketsServerPort = 1337;

var Game = require('./Game');
var FileChooser = require('./FileChooser');

Game.on('clockLoopTick', function() {
    var currentState = Game.get();
    
    for (var i=0; i<CLIENTS.length; i++) {
        CLIENTS[i].connection.send(JSON.stringify({state:Game.get()}));
    }
});

function getIndex (id) {
    for (var i = 0; i < CLIENTS.length; i++) {
        if (id == CLIENTS[i].id) {
            return i;
        }
    }
    
    return null;
}

function getUniqueID () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4();
}

var webSocketServer = require('websocket').server;
var http = require('http');

/**
 * HTTP server
 */
 
var server = http.createServer(function(request, response) {
  // Not important for us. We're writing WebSocket server,
  // not HTTP server
});

server.listen(webSocketsServerPort, function() {
  console.log((new Date()) + " Server is listening on port "
      + webSocketsServerPort);
});

/**
 * WebSocket server
 */
 
var wsServer = new webSocketServer({
  // WebSocket server is tied to a HTTP server. WebSocket
  // request is just an enhanced HTTP request. For more info 
  // http://tools.ietf.org/html/rfc6455#page-6
  httpServer: server
});


// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function(request) {
  console.log((new Date()) + ' Connection from origin ' + request.origin + '.');
  
  var connection = request.accept(null, request.origin);
  var id = getUniqueID();
  
  var session = new ClientSession(connection, id);
    
  // we need to know client index to remove them on 'close' event
  var index = CLIENTS.push(session) - 1;
    
  var syncMode = true;
  
  console.log((new Date()) + ' Connection accepted: ' + id );  
  
  connection.send(JSON.stringify({connected:{index:index}}));
  connection.send(JSON.stringify({logos:FileChooser.get()}));
  
  
  connection.on('message', function(message) {
    if (message.type === 'utf8') { // accept only text
        // code
        msgJson = JSON.parse(message.utf8Data);
        for (key in msgJson) {
            switch (key) {
                case 'score':
                    for (team in msgJson[key]) {
                        console.log('score');
                        Game.updateScore(team, msgJson[key][team]);
                        console.log("Setting: " + team + " score: " + msgJson[key][team]);
                    }
                    break;
                case 'startClock':
                    Game.startClock(msgJson[key]);
                    console.log("Starting clock: " + msgJson[key]);
                    break;
                case 'stopClock':
                    Game.stopClock(msgJson[key]);
                    console.log("Stopping clock: " + msgJson[key]);
                    break;
                case 'updateClock':
                    for (clock in msgJson[key]) {
                        Game.clocks[clock].update(null, msgJson[key][clock], null, null);
                        console.log("Got " + clock + " clock update: " + msgJson[key][clock]);                        
                    }
                    break;
                case 'updatePeriodNumber':
                    Game.updatePeriodNumber(msgJson[key]);
                    break;
                case 'setState':
                    switch (msgJson[key]) {
                        case 'halftime':
                            Game.updateState('halftime');
                            break;
                        case 'endgame':
                            Game.updateState('endgame');
                            break;
                    }
                    break;
                case 'setTeamName':
                    for (team in msgJson[key]) {
                        if (team == 'home' || team == 'away') {
                            console.log("Setting team name for " + team + ": " + msgJson[key][team]);
                            Game.teams[team].updateInfo(msgJson[key][team], null, null);
                        }
                    }                    
                    break;
                case 'setTeamColour':
                    for (team in msgJson[key]) {
                        if (team == 'home' || team == 'away') {
                            console.log("Setting team colour for " + team + ": " + msgJson[key][team]);
                            Game.teams[team].updateInfo(null, msgJson[key][team], null);
                        }
                    }                    
                    break;
                case 'setTeamLogo':
                    for (team in msgJson[key]) {
                        if (team == 'home' || team == 'away') {
                            console.log("Setting team logo for " + team + ": " + msgJson[key][team]);
                            Game.teams[team].updateInfo(null, null, msgJson[key][team]);
                        }
                    }                    
                    break;
                case 'resetGame':
                    var p = {
                            homeTeamName        : '',
                            homeTeamColour      : null,
                            homeTeamLogo        : null,
                            awayTeamName        : '',
                            awayTeamColour      : null,
                            awayTeamLogo        : null,
                            periodLengthSec     : 900,
                            halftimeLengthSec   : 1200,                        
                    };                    
                    for (item in msgJson[key]) {
                        if (item in p) {
                            p[item] = msgJson[key][item];
                        }
                    }                    
                    Game.resetGame(p.homeTeamName, p.homeTeamColour, p.homeTeamLogo, p.awayTeamName, p.awayTeamColour, p.awayTeamLogo, p.periodLengthSec, p.halftimeLengthSec);
                    break;
                    
                default:
                    console.log("WARNING: Unknown key: " + key);
            }
        }
    }
  });  
  
    // client disconnected  
    connection.on('close', function(connection) {
        if (CLIENTS.length > 0) {
            index = getIndex(id);
        
            console.log((new Date()) + " Peer disconnected: " + id);      
            // remove client from the list of connected clients
            CLIENTS.splice(index, 1);
        
        }
    });
});