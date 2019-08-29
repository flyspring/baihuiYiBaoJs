export class Connection {

    private ip:string = '';

    private port:string = '';

    private url:string = '';

    private reqStatus:boolean = false;

    private websocket:any;

    private handler:any;

    private debug:boolean;

    private connected:boolean = false;


    /**
     * construct
     * @param ip 
     * @param port 
     */
    public constructor(ip:string, port:string = '8000', debug:boolean = false) {
        this.ip = ip == '' ? 'localhost' : ip;
        this.port = port == '' ? '8000' : port;
        this.debug = debug;

        this.connected = false;
        this.reqStatus = false;
        this.websocket = false;
        this.handler = false;
    }

    /**
     * connect
     */
    public connect() : boolean {
        if (this.isConnected()) {
            return true;
        }

        //强制清空一下
        if (this.websocket) {
            this.websocket = false;
        }

        if (!this.websocket) {
            this.websocket = new WebSocket(this.getUrl());
             
            //onopen
            this.websocket.onopen =  (event:any) => {
                if (this.debug) {
                    console.log('onopen', event);
                }
                if (this.handler) {
                    this.handler({cmd:'HS_CONNECTED', rst:true, data:'{msg:"connect successfully"}'});
                }
            };

            //onerror
            this.websocket.onerror = (event:any) => {
                if (this.debug) {
                    console.log('onerror', event);
                }
                if (this.handler) {
                    this.handler({cmd:'HS_ERROR', rst:true, data:'{msg:"connect error"}'});
                }
            }

            //onmessage
            this.websocket.onmessage = (event:any) => {
                if (this.debug) {
                    console.log('onmessage', event);
                }

                this.setReqStatus(false);

                let idx = event.data.indexOf('>');
                let cmd = event.data.substring(0, idx);
                let data = event.data.substring(idx + 1, event.data.length);
                let rst = data.substring(0, 2) == "T:" ? true : false;
                data = data.substring(2, data.length); 

                var rstData = data;
                try {
                    if (rst && data != '') {
                        rstData = JSON.parse(data);
                    }
                } catch (error) {
                    //有些不是json格式字符串
                }

                if (this.handler) {
                    this.handler({cmd:cmd, rst:rst, data:rstData});
                }
            }

            //onclose
            this.websocket.onclose = (event:any) => {
                if (this.debug) {
                    console.log('onclose', event);
                }

                this.connected = false;
                if (this.handler) {
                    this.handler({cmd:'HS_DISCONNECTED', rst:true, data:'{msg:"connect closed"}'});
                }
            }
        }

        //更新链接状态，请求状态
        this.setConnected(true);
        this.setReqStatus(false);

        return true;
    }

    /**
     * Send msg
     * @param ybType
     * @param event
     * @param data 
     */
    public sendMsg(ybType:string, event:string, data:any) {
        if (!this.isConnected()) {
            return {code:2, msg:'HIS链接中断需要重新连接'};
        }

        if (this.getReqStatus()) {
            return {code:3, msg:'有请求未处理完，请稍后重试'};
        }

        this.setReqStatus(true);

        this.websocket.send(ybType + ":" + event + ">" + data);

        return {code:1, msg:'发送成功'};
    }

    /**
     * set handler
     * @param handler 
     */
    public setHandler(handler:any) {
        this.handler = handler;
    }

    /**
     * is requesting
     */
    public getReqStatus() : boolean {
        return this.reqStatus;
    }

    /**
     * set req status
     * @param status 
     */
    public setReqStatus(status:boolean) {
        this.reqStatus = status;
    }

    /**
     * is connect
     */
    public isConnected() : boolean {
        return this.websocket && this.connected;
    }

    /**
     * set connected
     * @param connected 
     */
    public setConnected(connected:boolean) {
        this.connected = connected;
    }

    /**
     * get url
     */
    public getUrl() : string {
        if (this.url == '') {
            this.url = 'ws://' + this.ip + ':' + this.port + '/';
        }

        return this.url;
    }
}