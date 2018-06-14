# dmxnet
[![GitHub release](https://img.shields.io/github/release/margau/dmxnet.svg)](https://github.com/margau/dmxnet)
[![npm](https://img.shields.io/npm/v/dmxnet.svg)](https://github.com/margau/dmxnet)
[![GitHub issues](https://img.shields.io/github/issues/margau/dmxnet.svg)](https://github.com/margau/dmxnet/issues)
[![GitHub stars](https://img.shields.io/github/stars/margau/dmxnet.svg)](https://github.com/margau/dmxnet/stargazers)
[![GitHub license](https://img.shields.io/github/license/margau/dmxnet.svg)](https://github.com/margau/dmxnet/blob/master/LICENSE)
[![Github All Releases](https://img.shields.io/github/downloads/margau/dmxnet/total.svg)](https://github.com/margau/dmxnet)
[![npm](https://img.shields.io/npm/dt/dmxnet.svg)](https://github.com/margau/dmxnet)

dmxnet is an ArtNet-DMX-sender and receiver for nodejs,
currently under heavy development!

Only the sender could be considered working by now.

## Changelog
**v0.1.1**
Added prepare channel

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

**Prepare Channel:**

```javascript
sender.prepChannel(channel,value);
```

Prepares *channel* (0-511) to *value* (0-255) without transmitting.

Change is transmitted with next 
```javascript
sender.transmit();
```
call, or the next periodically transmit. Useful for changing lots of channels at once/in parallel from device view.

**Transmit:**

```javascript
sender.transmit();
```

Transmits a new ArtDMX Frame manually.




**Please Note: dmxnet transmits a dmx-frame every 1000ms even if no channel has changed its value!**

## ToDo:

- Receiving ArtDmx
- Receiving ArtPoll
- Sending ArtPollReply
- Act as Controller (Sending ArtPoll)
- Maybe support sACN?


### Please feel free to contribute!



## Credits

**Art-Net™ Designed by and Copyright Artistic Licence Holdings Ltd**
