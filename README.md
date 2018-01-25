# dmxnet
[![GitHub version](https://badge.fury.io/gh/margau%2Fdmxnet.svg)](https://badge.fury.io/gh/margau%2Fdmxnet)

dmxnet is an ArtNet-DMX-sender and receiver for nodejs,
currently under heavy development!

Only the sender could be considered working by now.

## Changelog

**v0.1.0**
Initital Release, sending ArtDMX working

## Installation

**How to install latest release:**

```bash
npm install dmxnet 
```

**How to install current development version:**

```bash
npm install git+https://git@github.com/margau/dmxnet.git 
```

## Usage

**See example_rx.js and example_tx.js**

**Include dmxnet lib:**

```javascript
var dmxlib=require('dmxnet');
```

**Create new dmxnet object:**

```javascript
var dmxnet = new dmxlib.dmxnet(options);
```

Options:

```javascript
{
  verbose: 1, //Verbosity, default 0
  oem: 0 //OEM Code from artisticlicense, default to dmxnet OEM
}
```

### Transmitting Art-Net

**Create new sender object:**

```javascript 
var sender=dmxnet.newSender(options);
```

Options:

```javascript
{
  ip: "127.0.0.1", //IP to send to, default 255.255.255.255
  subnet: 0, //Destination subnet, default 0
  universe: 0, //Destination universe, default 0
  net: 0, //Destination net, default 0
  port: 6454 //Destination UDP Port, default 6454
}
```

**Set Channel:**

```javascript
sender.setChannel(channel,value);
```

Sets *channel* (0-511) to *value* (0-255) and transmits the changed values .

**Fill Channels**

```javascript
sender.fillChannels(min,max,value);
```

Sets all channels between *min* and *max* (including these) to *value* and transmits the values.

**Please Note: dmxnet transmits a dmx-frame every 1000ms even if no channel has changed its value!**

## ToDo:

- Receiving ArtDmx
- Receiving ArtPoll
- Sending ArtPollReply
- Act as Controller (Sending ArtPollReply)
- Maybe support sACN?


## Credits

**Art-Net™ Designed by and Copyright Artistic Licence Holdings Ltd**
