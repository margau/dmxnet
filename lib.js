var dgram = require('dgram');
var jspack = require('jspack').jspack;
//Require Logger
const manager = require('simple-node-logger').createLogManager();
//Init Logger
const log = manager.createLogger('dmxnet');

// ArtDMX Header for jspack
var ArtDmxHeaderFormat = '!7sBHHBBBBH';
// ArtDMX Payload for jspack
var ArtDmxPayloadFormat = '512B';

//dmxnet constructor
function dmxnet(options) {
  // Parse all options and set defaults
  this.verbose = options.verbose || 0;
  this.oem = options.oem || 2908; // OEM code hex
  this.port = options.listen || 6454; // Port listening for incoming data
  // Set log levels
  if (this.verbose > 0) {
    log.setLevel('info');
    if (this.verbose > 1) {
      log.setLevel('debug');
    }
  } else {
    log.setLevel('warn');
  }
  // Log started information
  log.info("started with options " + JSON.stringify(options));

  // Array containing reference to foreign controllers
  this.controllers = Array();
  // Array containing reference to foreign node's
  this.nodes = Array();
  // Timestamp of last Art-Poll send
  this.last_poll;
  //Create listener for incoming data
  if (!Number.isInteger(this.port)) throw "Invalid Port";
  this.listener4 = dgram.createSocket({
    type: 'udp4',
    reuseAddr: true
  });
  // ToDo: IPv6
  // ToDo: Multicast
  // Catch Socket errors
  this.listener4.on("error", function(err) {
    throw "Socket error: " + err;
  });
  // Register listening object
  this.listener4.on('message', (msg, rinfo) => {
    dataParser(msg, rinfo, this);
  });
  // Start listening
  this.listener4.bind(this.port);
  log.info("Listening on port " + this.port);
  // Periodically check Controllers
  setInterval(() => {
    if (this.controllers) {
      log.debug("Check controller alive, count "+this.controllers.length);
      for (var index = 0; index < this.controllers.length; index++) {
        if ((new Date().getTime() - new Date(this.controllers[index].last_poll).getTime()) > 60000) {
          this.controllers[index].alive = false;
        }
      }
    }
  }, 30000);
  return this;
}
//get a new sender object
dmxnet.prototype.newSender = function(options) {
  return new sender(options, this);
}

//define sender with user options and inherited parent object
sender = function(options, parent) {
  //save parent object
  this.parent = parent;

  this.socket_ready = false;
  //set options
  var options = options || {};
  this.net = options.net || 0;
  this.subnet = options.subnet || 0;
  this.universe = options.universe || 0;
  this.subuni = options.subuni;
  this.ip = options.ip || "255.255.255.255";
  this.port = options.port || 6454;
  this.verbose = this.parent.verbose;

  // Validate Input
  if (this.net > 127) {
    throw "Invalid Net, must be smaller than 128";
  }
  if (this.universe > 15) {
    throw "Invalid Universe, must be smaller than 16";
  }
  if (this.subnet > 15) {
    throw "Invalid subnet, must be smaller than 16";
  }
  if ((this.net < 0) || (this.subnet < 0) || (this.universe < 0)) {
    throw "Subnet, Net or Universe must be 0 or bigger!";
  }
  if (this.verbose > 0) {
    log.info("new dmxnet sender started with params: " + JSON.stringify(options));
  }
  //init dmx-value array
  this.values = new Array()
  //fill all 512 channels
  for (var i = 0; i < 512; i++) {
    this.values[i] = 0;
  }
  //Build Subnet/Universe/Net Int16
  if (!this.subuni) {
    this.subuni = (this.subnet << 4) | (this.universe);
  }
  //ArtDmxSeq
  this.ArtDmxSeq = 1;

  //Create Socket
  this.socket = dgram.createSocket('udp4');
  _this = this;
  //Check IP and Broadcast
  if (isBroadcast(this.ip)) {
    this.socket.bind(function() {
      _this.socket.setBroadcast(true);
      _this.socket_ready = true;
    });

  } else {
    this.socket_ready = true;
  }
  //Transmit first Frame
  this.transmit();

  //Workaround for this-Contect inside setInterval
  var _this = this;
  //Send Frame all 1000ms even there is no channel change
  this.interval = setInterval(function() {
    _this.transmit();
  }, 1000);
}
//Transmit function
sender.prototype.transmit = function() {
  //Only transmit if socket is ready
  if (this.socket_ready) {
    if (this.ArtDmxSeq > 255) {
      this.ArtDmxSeq = 1;
    }
    //Build packet: ID Int8[8], OpCode Int16 0x5000 (conv. to 0x0050), ProtVer Int16, Sequence Int8, PhysicalPort Int8, SubnetUniverseNet Int16, Length Int16
    var udppacket = Buffer.from(jspack.Pack(ArtDmxHeaderFormat + ArtDmxPayloadFormat, ["Art-Net", 0, 0x0050, 14, this.ArtDmxSeq, 0, this.subuni, this.net, 512].concat(this.values)));
    //Increase Sequence Counter
    this.ArtDmxSeq++;

    log.debug("Packet content: " + udppacket.toString('hex'));
    //Send UDP
    var client = this.socket;
    _this = this;
    client.send(udppacket, 0, udppacket.length, this.port, this.ip, function(err, bytes) {
      if (err) throw err;
      log.info('ArtDMX frame sent to ' + _this.ip + ':' + _this.port);
    });
  }
};
//SetChannel function
sender.prototype.setChannel = function(channel, value) {
  if ((channel > 511) || (channel < 0)) {
    throw "Channel must be between 0 and 512";
  }
  if ((value > 255) || (value < 0)) {
    throw "Value must be between 0 and 255";
  }
  this.values[channel] = value;
  this.transmit();
};
//PrepChannel function
sender.prototype.prepChannel = function(channel, value) {
  if ((channel > 511) || (channel < 0)) {
    throw "Channel must be between 0 and 512";
  }
  if ((value > 255) || (value < 0)) {
    throw "Value must be between 0 and 255";
  }
  this.values[channel] = value;
};
//SetChannels
sender.prototype.setChannels = function(channels) {

};
//Fill Channels
sender.prototype.fillChannels = function(start, stop, value) {
  if ((start > 511) || (start < 0)) {
    throw "Channel must be between 0 and 512";
  }
  if ((stop > 511) || (stop < 0)) {
    throw "Channel must be between 0 and 512";
  }
  if ((value > 255) || (value < 0)) {
    throw "Value must be between 0 and 255";
  }
  for (var i = start; i <= stop; i++) {
    this.values[i] = value;
  }
  this.transmit();
};
//Stop sender
sender.prototype.stop = function() {
  clearInterval(this.interval);
  this.socket.close();
};
//ToDo: Improve method
function isBroadcast(ipaddress) {
  var oct = ipaddress.split('.');
  if (oct.length != 4) {
    throw "Wrong IPv4 lenght";
  }
  for (var i = 0; i < 4; i++) {
    if ((parseInt(oct[i]) > 255) || (parseInt(oct[i]) < 0)) {
      throw "Invalid IP (Octet " + (i + 1) + ")";
    }
  }
  if (oct[3] == '255') {
    return true;
  }
  return false;
}
// Receiver

// Parser
dataParser = function(msg, rinfo, parent) {
  log.debug(`got UDP from ${rinfo.address}:${rinfo.port}`);
  if (rinfo.size < 10) {
    log.debug("Payload to short");
    return;
  }
  // Check first 8 bytes for the "Art-Net" - String
  if (jspack.Unpack("!8s", msg) != "Art-Net\u0000") {
    log.debug("Invalid header");
    return;
  }
  var opcode = parseInt(jspack.Unpack("B", msg, 8));
  opcode += parseInt(jspack.Unpack("B", msg, 9)) * 256;
  if (!opcode || opcode == 0) {
    log.debug("Invalid OpCode");
    return;
  }
  switch (opcode) {
    case 0x5000:
      // ToDo
      log.debug("detected ArtDMX")
      break;
    case 0x2000:
      log.debug("detected ArtPoll");
      // Parse Protocol version
      var proto = parseInt(jspack.Unpack("B", msg, 10));
      proto += parseInt(jspack.Unpack("B", msg, 11)) * 256;
      if (!proto || proto < 14) {
        log.debug("Invalid OpCode");
        return;
      }
      // Parse TalkToMe
      var ctrl = {
        ip: rinfo.address,
        family: rinfo.family,
        last_poll: Date(),
        alive: true
      };
      var ttm_raw = parseInt(jspack.Unpack("B", msg, 12));
      ctrl.diagnostic_unicast = ((ttm_raw & 0b00001000) > 0);
      ctrl.diagnostic_enable = ((ttm_raw & 0b00000100) > 0);
      ctrl.unilateral = ((ttm_raw & 0b00000010) > 0);
      // Insert into controller's reference
      var done = false;
      for (var index = 0; index < parent.controllers.length; ++index) {
        if (parent.controllers[index].ip == rinfo.address) {
          done = true;
          parent.controllers[index] = ctrl;
        }
      }
      if (done != true) {
        parent.controllers.push(ctrl);
      }
      log.debug("Controllers: " + JSON.stringify(parent.controllers));
      break;
    case 0x2100:
      // ToDo
      log.debug("detected ArtPollReply");
      break;
    default:
      log.debug("OpCode not implemented");
  }

}
// Export dmxnet
module.exports = {
  dmxnet
};
