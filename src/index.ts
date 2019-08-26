import { Connection } from "./connection";

export class BaiHuiYiBaoJs {

    private ybType:string;

    private connection:Connection;

    private options:any;

    private callbacks:{};

    private defaultCallbacks:{};

    constructor(ybType:string, options?:any) {
        this.ybType = ybType;
        this.setOptions(options);

        this.defaultCallbacks = {
            "HS_CONNECTED": this.init, 
            "RST_INIT": this.login,
            "RST_LOGIN": this.ready,
            "HS_DISCONNECTED": this.close,
            "HS_ERROR": this.error,
        };

        //回调默认设置
        this.callbacks = {
            "RST_READ_CARD": false, 
            "RST_REGISTRATION": false, 
            "RST_CALC_REG": false,
            "RST_CALC_PST": false,
            "RST_PAY_REG": false,
            "RST_PAY_PST": false,
        };


        //链接医保助手
        this.connection = new Connection(this.options.ip, this.options.port, this.options.debug);
        this.connection.setHandler((event:any) => {
            // if (this.options.debug) {
            //     console.log('handleEvent', event);
            // }
    
            if (!event || !event.cmd) {
                return false;
            }

            let handler = this.getDefaultCallback(event.cmd);
            if (handler) {
                handler.call(this, event.rst, event.data); //上下文还是当前this
                return;
            }

            handler = this.getCallback(event.cmd);
            if (handler) {
                var rstData = event.rst ? JSON.parse(event.data) : event.data;
                handler(this.ybType, event.rst, rstData);
            }
        });

        this.connection.connect();
    }

    /**
     * set options
     * @param options 
     */
    protected setOptions(options:any) {
        this.options = {
            ip: options.ip || 'localhost',
            port: options.port || '8000',
            debug: options.debug || false,
            userName: options.userName || '', 
            userId: options.userId || '',
            yibao: options.yibao || {},
        };
    }

    /**
     * 链接后进行初始化操作
     * @param rst 
     * @param data 
     */
    protected init(rst:boolean, data:any) {
        if (!rst) {
            console.log('链接失败，无法进行初始化操作');
            return false;
        }

        if (!this.options.yibao.医院编码) {
            if (this.options.debug) {
                console.log('初始化医保参数有误');
            }
            return false;
        }

        this.sendMsg('REQ_INIT', this.options.yibao);
    }

    /**
     * 完成初始化后登陆
     * @param rst
     * @param data 
     */
    protected login(rst:boolean, data:any) {
        if (!rst) {
            console.log('init初始化失败，无法进行后续登录签到操作');
            return false;;
        }

        if (!this.options.userName || !this.options.userId) {
            alert('医保登录失败，缺少操作名或者操作人编号');
            return false;
        }

        let convertData = {"操作员编号": this.options.userId, "操作员姓名": this.options.userName};
        this.sendMsg('REQ_LOGIN', convertData);
    }

    /**
     * 完成登录准备
     * @param rst 
     * @param data 
     */
    protected ready(rst:boolean, data:any) {
        if (!rst) {
            console.log(this.ybType + ': 登录签到失败');
            return false;
        }

        console.log(this.ybType + ': 登录签到成功，业务周期编号：' + data);
    }

    /**
     * 链接断开
     * @param rst
     * @param data 
     */
    protected close(rst:boolean, data:any) {
        console.log(this.ybType + ': 链接断开');
    }

    /**
     * 出现错误
     * @param ybType 
     * @param data 
     */
    protected error(ybType:string, data:any) {
        alert(ybType + ': 链接医保助手出现异常，请确保医保助手已经启动');
    }

    /**
     * 读卡
     * @param data 
     */
    public readCard(data?:any) {
        if (this.options.debug) {
            console.log('正在请求读卡', data);
        }
        this.sendMsg('REQ_READ_CARD', '');
    }

    /**
     * register
     * @param data 
     */
    public register(data?:any) {
        if (this.options.debug) {
            console.log('正在请求登记', data);
        }
        this.sendMsg('REQ_REGISTRATION', data);
    }

    /**
     * try calc 
     * @param type PST, REG
     * @param data 
     */
    public tryCalc(type:string, data?:any) {
        type = type.toUpperCase();
        if (type != 'PST' && type != 'REG') {
            console.log('试算参数有误');
            return;
        }

        if (this.options.debug) {
            console.log('正在试算', data);
        }
        this.sendMsg('REQ_CALC_' + type, data);
    }

    /**
     * pay calc
     * @param type PST, REG
     * @param data 
     */
    public payCalc(type:string, data?:any) {
        type = type.toUpperCase();
        if (type != 'PST' && type != 'REG') {
            console.log('结算参数有误');
            return;
        }

        if (this.options.debug) {
            console.log('正在结算', data);
        }
        this.sendMsg('REQ_PAY_' + type, data);
    }

    /**
     * set callbacks
     * @param callbacks 
     */
    public setCallbacks(callbacks:Array<{cmd:string, callback:(ybType:string, rst:boolean, data:any) => any}>) {
        callbacks.forEach(element => {
            if (element.cmd && element.callback) {
                this.setCallback(element.cmd, element.callback);
            }
        });
    }

    /**
     * set callback
     * @param cmd
     * @param callback 
     */
    public setCallback(cmd:string, callback:(ybType:string, rst:boolean, data:any) => any) {
        cmd = 'RST_' + cmd.toUpperCase();

        this.callbacks[cmd] = callback;
    }
    
    /**
     * get default callback
     * @param cmd
     */
    protected getDefaultCallback(cmd:string) {
        return this.getHandler(this.defaultCallbacks, cmd);
    }

    /**
     * get callback
     * @param cmd
     */
    protected getCallback(cmd:string) {
        return this.getHandler(this.callbacks, cmd);
    }

    /**
     * get handler
     * @param callbacks 
     * @param cmd 
     */
    protected getHandler(callbacks:{}, cmd:string)
    {
        if (!callbacks || !callbacks[cmd]) {
            return false;
        }

        return callbacks[cmd];
    }

    /**
     * send msg
     * @param event 
     * @param data 
     */
    protected sendMsg(event:string, data:any) {
        if (data) {
            data = JSON.stringify(data);
        }

        var ret = this.connection.sendMsg(this.ybType, event, data);
        if (ret.code != 1) {
            alert(ret.msg);
            return false;
        }

        return true;
    }
}