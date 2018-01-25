var dgram = require('dgram');
var jspack = require('jspack').jspack;

// ArtDMX Header for jspack
var ArtDmxHeaderFormat = '!7sBHHBBBBH';
// ArtDMX Payload for jspack
var ArtDmxPayloadFormat = '512B';


//dmxnet constructor
function dmxnet(options) {
	this.verbose=options.verbose || 0;
	this.oem=options.oem || 0;
    if(this.verbose>0) {
        console.log("dmxnet started with options "+JSON.stringify(options));
    }
    //ToDo: Register Sender and Receiver    
    //ToDo: Send ArtPoll
    return this;
}
//get a new sender object
dmxnet.prototype.newSender=function(options) {
    return new sender(options,this);
}

//define sender with user options and inherited parent object
sender=function (options,parent){
    //save parent object
    this.parent=parent;

    this.socket_ready=false;
    //set options
	var options = options || {};
	this.net=options.net || 0;
	this.subnet=options.subnet || 0;
	this.universe=options.universe || 0;
	this.ip=options.ip || "255.255.255.255";
    this.port=options.port || 6454; 
    this.verbose=this.parent.verbose;
    //Validate Input
	if(this.net>127) {
        throw "Invalid Net, must be smaller than 128";
    }
	if(this.universe>15) {
        throw "Invalid Universe, must be smaller than 16";
    }
    if(this.subnet>15) {
        throw "Invalid subnet, must be smaller than 16";
    }
    if((this.net<0)||(this.subnet<0)||(this.universe<0)) {
        throw "Subnet, Net or Universe must be 0 or bigger!";
    }
	if(this.verbose>0) {
		console.log("new dmxnet sender started with params: "+JSON.stringify(options));
	}
	//init dmx-value array
	this.values=new Array()
	//fill all 512 channels
	for(var i = 0; i < 512; i++) {
		this.values[i]=0;
	}
	//Build Subnet/Universe/Net Int16
    this.subuni=(this.subnet<<4)|(this.universe);
    //ArtDmxSeq
    this.ArtDmxSeq=1;

    //Create Socket
    this.socket=dgram.createSocket('udp4');
    _this=this;
    //Check IP and Broadcast
    if(isBroadcast(this.ip)) {
        this.socket.bind(function() {
            _this.socket.setBroadcast(true);
            _this.socket_ready=true;
        });
        
    } else {
        this.socket_ready=true;
    }
    //Transmit first Frame
	this.transmit();
    
    //Workaround for this-Contect inside setInterval
    var _this=this;
    //Send Frame all 1000ms even there is no channel change
    this.interval=setInterval(function() {
       _this.transmit();
    },1000);
}
//Transmit function
sender.prototype.transmit = function () {
    //Only transmit if socket is ready
	if(this.socket_ready) {
        if(this.ArtDmxSeq>255) {
		    this.ArtDmxSeq=1;
	    }
	    //Build packet: ID Int8[8], OpCode Int16 0x5000 (conv. to 0x0050), ProtVer Int16, Sequence Int8, PhysicalPort Int8, SubnetUniverseNet Int16, Length Int16 
	    var udppacket=new Buffer(jspack.Pack(ArtDmxHeaderFormat+ArtDmxPayloadFormat,["Art-Net",0,0x0050,14,this.ArtDmxSeq,0,this.subuni,this.net,512].concat(this.values)));
        //Increase Sequence Counter    
        this.ArtDmxSeq++;

        if(this.verbose>1) {
            console.log("Transmitting frame");
        }
        if(this.verbose>2) {
            console.log(udppacket.toString('hex'));
        }
        //Send UDP
        var client=this.socket;
        _this=this;
        client.send(udppacket, 0, udppacket.length, this.port, this.ip, function(err, bytes) {
            if (err) throw err;
            if(_this.verbose>1) {
                console.log('ArtDMX frame sent to ' + _this.ip +':'+ _this.port);
            }
        });
    }
};
//SetChannel function
sender.prototype.setChannel = function (channel, value) {
    if((channel>511) || (channel < 0)) {
        throw "Channel must be between 0 and 512";
    }
    if((value > 255) || (value<0)) {
        throw "Value must be between 0 and 255";
    }
    this.values[channel]=value;
    this.transmit();
};
//SetChannels
sender.prototype.setChannels = function (channels) {

};
//Fill Channels
sender.prototype.fillChannels = function (start, stop, value) {
    if((start>511) || (start < 0)) {
        throw "Channel must be between 0 and 512";
    }
    if((stop>511) || (stop < 0)) {
        throw "Channel must be between 0 and 512";
    }
    if((value > 255) || (value<0)) {
        throw "Value must be between 0 and 255";
    }
    for(var i=start;i<=stop;i++) {
        this.values[i]=value;
    }
    this.transmit();
};
//Stop sender
sender.prototype.stop = function() {
    clearInterval(this.interval);
    this.socket.close();
};
function isBroadcast(ipaddress) {
	var oct=ipaddress.split('.');
	if(oct.length!=4) {
		throw "Wrong IPv4 lenght";
	}
	for(var i=0;i<4;i++) {
		if((parseInt(oct[i])>255)||(parseInt(oct[i])<0)) {
			throw "Invalid IP (Octet "+(i+1)+")";
		}
	}
	if(oct[3]=='255') {
		return true;
	}
	return false;
}
//ToDo: Receiver
//Export dmxnet
module.exports = {dmxnet};
