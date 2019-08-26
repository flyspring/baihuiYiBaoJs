export declare class Connection {
    private ip;
    private port;
    private url;
    private reqStatus;
    private websocket;
    private handler;
    private debug;
    private connected;
    /**
     * construct
     * @param ip
     * @param port
     */
    constructor(ip: string, port?: string, debug?: boolean);
    /**
     * connect
     */
    connect(): boolean;
    /**
     * Send msg
     * @param ybType
     * @param event
     * @param data
     */
    sendMsg(ybType: string, event: string, data: any): {
        code: number;
        msg: string;
    };
    /**
     * set handler
     * @param handler
     */
    setHandler(handler: any): void;
    /**
     * is requesting
     */
    getReqStatus(): boolean;
    /**
     * set req status
     * @param status
     */
    setReqStatus(status: boolean): void;
    /**
     * is connect
     */
    isConnected(): boolean;
    /**
     * set connected
     * @param connected
     */
    setConnected(connected: boolean): void;
    /**
     * get url
     */
    getUrl(): string;
}
