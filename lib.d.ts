import { Socket } from 'dgram'
import { EventEmitter } from 'events'
import { NetworkInterfaceInfo } from 'os'

/**
 * Minimal logger interface accepted by dmxnet.
 * Compatible with pino, winston, bunyan, console, and any custom logger
 * that implements these five methods.
 */
export interface Logger {
    trace(obj: object, msg?: string, ...args: unknown[]): void
    trace(msg: string, ...args: unknown[]): void
    debug(obj: object, msg?: string, ...args: unknown[]): void
    debug(msg: string, ...args: unknown[]): void
    info(obj: object, msg?: string, ...args: unknown[]): void
    info(msg: string, ...args: unknown[]): void
    warn(obj: object, msg?: string, ...args: unknown[]): void
    warn(msg: string, ...args: unknown[]): void
    error(obj: object, msg?: string, ...args: unknown[]): void
    error(msg: string, ...args: unknown[]): void
}

export interface NetworkInterface {
    ip: NetworkInterfaceInfo['address']
    netmask: NetworkInterfaceInfo['netmask']
    mac: NetworkInterfaceInfo['mac']
    broadcast: string
}

export interface Controller {
    ip: string
    family: 'IPv4' | 'IPv6'
    last_poll: string
    alive: boolean
}

export interface SenderOptions {
    net?: number
    subnet?: number
    universe?: number
    subuni?: number
    ip?: string
    port?: number
    base_refresh_interval?: number
}

declare interface sender extends Required<SenderOptions> { }

/**
 * Class representing a sender
 */
declare class sender {
    /**
     * Creates a new sender, usually called trough factory in dmxnet
     *
     * @param {SenderOptions} [opt] - Options for the sender
     * @param {dmxnet} parent - Instance of the dmxnet parent
     */
    constructor(opt: SenderOptions | undefined, parent: dmxnet)
    parent: dmxnet
    socket_ready: boolean
    values: number[]
    ArtDmxSeq: number
    socket: Socket
    interval: NodeJS.Timeout
    /**
     * Transmits the current values
     */
    transmit(): void
    /**
     * Sets a single channel to a value and transmits the change
     *
     * @param {number} channel - channel (0-511)
     * @param {number} value - value (0-255)
     */
    setChannel(channel: number, value: number): void
    /**
     * Prepares a single channel (without transmitting)
     *
     * @param {number} channel - channel (0-511)
     * @param {number} value - value (0-255)
     */
    prepChannel(channel: number, value: number): void
    /**
     * Fills channel block with a value and transmits the change
     *
     * @param {number} start - start of the block
     * @param {number} stop - end of the block (inclusive)
     * @param {number} value - value
     */
    fillChannels(start: number, stop: number, value: number): void
    /**
     * Resets all channels to zero and Transmits
     */
    reset(): void
    /**
     * Stops the sender and destroys it
     */
    stop(): void
}

export interface ReceiverOptions {
    net?: number
    subnet?: number
    universe?: number
    subuni?: number
}

declare interface receiver extends Required<ReceiverOptions> { }

/**
 *  Object representing a receiver-instance
 */
declare class receiver extends EventEmitter {
    /**
     * Creates a new receiver, usually called trough factory in dmxnet
     *
     * @param {ReceiverOptions} [opt] - Options for the receiver
     * @param {dmxnet} parent - Instance of the dmxnet parent
     */
    constructor(opt: ReceiverOptions | undefined, parent: dmxnet)
    parent: dmxnet
    values: number[]
    subuninet: number
    /**
     * Handles received data
     *
     * @param {Array.Number} data - Data from received ArtDMX
     */
    receive(data: number[]): void
}

export interface DmxnetOptions {
    /**
     * Optional logger instance. Must implement trace/debug/info/warn/error.
     * Compatible with pino, winston, bunyan, console, and similar loggers.
     * If omitted, all logging is suppressed.
     */
    logger?: Logger
    oem?: number
    esta?: number
    listen?: number
    sName?: string
    lName?: string
    hosts?: string[]
    errFunc?: (err: Error) => void
}

declare interface dmxnet extends Required<Omit<DmxnetOptions, 'listen'>> { }

/** Class representing the core dmxnet structure */
declare class dmxnet {
    /**
     * Creates a new dmxnet instance
     *
     * @param {DmxnetOptions} [options] - Options for the whole instance
     */
    constructor(options?: DmxnetOptions)
    /** The active logger instance (no-op if none was provided). */
    logger: Logger
    port: DmxnetOptions['listen']
    interfaces: Record<string, NetworkInterfaceInfo[]>
    ip4: NetworkInterface[]
    /**
     * @deprecated Unused
     */
    ip6: unknown[]
    artPollReplyCount: number
    controllers: Controller[]
    /**
     * @deprecated Unused
     */
    nodes: unknown[]
    senders: sender[]
    receivers: receiver[]
    receiversSubUni: Record<number, receiver>
    listener4: Socket
    socket: Socket
    socket_ready: boolean
    /**
     * Returns a new sender instance
     *
     * @param {SenderOptions} [options] - Options for the new sender
     * @returns {sender} - Instance of Sender
     */
    newSender(options?: SenderOptions): sender
    /**
     * Returns a new receiver instance
     *
     * @param {ReceiverOptions} [options] - Options for the new receiver
     * @returns {receiver} - Instance of Receiver
     */
    newReceiver(options?: ReceiverOptions): receiver
    /**
     * Builds and sends an ArtPollReply-Packet
     */
    ArtPollReply(): void
}

export type { sender, receiver }
export { dmxnet }
