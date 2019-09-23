import { Connection } from "./connection";

export class BaiHuiYiBaoJs {

    private ybType:string;

    private connection:Connection;

    private options:any;

    private callbacks:{};

    private defaultCallbacks:{};

    private unPayItems = []; //项目编号为空的，不参与计算的项目
    private pstNo = ''; //最新一次结算的处方号，用于merge未参与计算项目时的比较，确保是一个方案

    constructor(ybType:string, options?:any) {
        this.ybType = ybType;
        this.setOptions(options);

        this.defaultCallbacks = {
            "HS_CONNECTED": this.init, 
            "RST_INIT": this.login,
            //"RST_LOGIN": this.ready,
            "HS_DISCONNECTED": this.close,
            "HS_ERROR": this.error,
        };

        //回调默认设置
        this.callbacks = {
            "RST_LOGIN": false,
            "RST_READ_CARD": false, 
            "RST_REGISTRATION": false, 
            "RST_CALC_REG": false,
            "RST_CALC_PST": false,
            "RST_PAY_REG": false,
            "RST_PAY_PST": false,
        };
    }

    /**
     * connect yibao
     */
    public connect() {
        if (this.connection && this.connection.isConnected()) {
            let handler = this.getCallback('RST_LOGIN');
            if (handler) {
                handler(this.ybType, true, '');
            } else {
                this.ready(true, '');
            }

            return true;
        }

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
                //方案试算和结算处理前先拦截进行merge处理
                if (event.cmd == 'RST_CALC_PST' || event.cmd == 'RST_PAY_PST') {
                    event.data = this.mergeUnpayitems(event.data);
                }

                handler(this.ybType, event.rst, event.data);
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
        alert(this.ybType + ': 链接医保助手已断开')
    }

    /**
     * 出现错误
     * @param ybType 
     * @param data 
     */
    protected error(rst:boolean, data:any) {
        alert(this.ybType + ': 链接医保助手出现异常，请确保医保助手已经启动');
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

        //进行拆分=有医保编号+没有医保编号的药材
        if (data['处方信息']) {
            let payItems = this.getEnabledCalcItems(data['处方信息']);
            if (payItems.length == 0) {
                let handler = this.getCallback('RST_CALC_PST');
                if (handler) {
                    handler(this.ybType, false, '处方里的药材全都没有医保编号，请选择其他支付方式');
                } else {
                    alert('处方里的药材全都没有医保编号，请选择其他支付方式');
                }
                return false;
            }

            data['处方信息'] = payItems;
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

        //进行拆分=有医保编号+没有医保编号的药材
        if (data['处方信息']) {
            let payItems = this.getEnabledCalcItems(data['处方信息']);
            if (payItems.length == 0) {
                let handler = this.getCallback('RST_CALC_PST');
                if (handler) {
                    handler(this.ybType, false, '处方里的药材全都没有医保编号，请选择其他支付方式');
                } else {
                    alert('处方里的药材全都没有医保编号，请选择其他支付方式');
                }
                return false;
            }

            data['处方信息'] = payItems;
        }

        this.sendMsg('REQ_PAY_' + type, data);
    }

    /**
     * 取消门诊号下所有未结算方案
     * 因为试算时，上传了处方信息，
     * 如果不结算的话，把此门诊号下的未结算处方撤销
     * @param type 
     * @param data 
     */
    public cancel(type:string, data?:any) {
        type = type.toUpperCase();
        if (type != 'PST' && type != 'REG') {
            console.log('撤销处方参数有误');
            return;
        }

        if (this.options.debug) {
            console.log('正在撤销处方', data);
        }
        this.sendMsg('REQ_CANCEL_' + type, data);
    }

    /**
     * refund
     * @param type 
     * @param data 
     */
    public refund(type:string, data?:any) {
        type = type.toUpperCase();
        if (type != 'PST' && type != 'REG') {
            console.log('撤销结算参数有误');
            return;
        }

        if (this.options.debug) {
            console.log('正在撤销结算', data);
        }
        this.sendMsg('REQ_REFUND_' + type, data);
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

    /**
     * get enabled calc Items
     * @param data
     */
    protected getEnabledCalcItems(items:any) {
        if (items.length == 0) {
            return [];
        }

        this.pstNo = ''; //每次进来都置为空
        this.unPayItems = []; //每次进来重新赋值
        let payItems = [];
        for (let i = 0; i < items.length; i++) {
            if (items[i]['项目自编码'] == '') {
                this.unPayItems.push(items[i]);
            } else {
                payItems.push(items[i]);
            }
        }

        //赋值一下处方号
        if (payItems.length > 0) {
            this.pstNo = payItems[payItems.length - 1]['处方号'];
        }

        if (this.options.debug) {
            console.log('unPayItems', this.unPayItems);
        }

        return payItems;
    }

    /**
     * merge unpay items
     */
    protected mergeUnpayitems(data:any) {
        if (data['明细详情'] && data['明细详情'].length > 0 && this.unPayItems.length > 0) {
            let len = data['明细详情'].length;
            let pstNo = data['明细详情'][len - 1]['处方号'];
            if (pstNo == this.pstNo) { //是一个处方
                let unPayItemsAmount = 0.00;
                for (let i = 0; i < this.unPayItems.length; i++) {
                    let itemAmount = this.unPayItems[i]['金额'] * this.unPayItems[i]['付数'];
                    unPayItemsAmount += itemAmount;
                    data['明细详情'].push({
                        "处方号":this.unPayItems[i]['处方号'],
                        "处方号流水号":this.unPayItems[i]['流水号'],
                        "金额":itemAmount.toFixed(3) + '',
                        "明细结果":"成功",
                        "项目等级":'',
                        "项目名称":this.unPayItems[i]['项目名称'],
                        "项目自编码":"",
                        "支付上限":"",
                        "自付比例":"1.0",
                        "自付金额":itemAmount.toFixed(3) + '',
                        "自理金额": "0.0"
                    });
                }

                //流水号排序
                data['明细详情'].sort(function (a:any, b:any) {
                    return a['处方号流水号'] - b['处方号流水号'];
                });

                data['支付详情']['医保现金'] = (data['支付详情']['医保现金'] * 1 + unPayItemsAmount).toFixed(3) + '';

                if (this.options.debug) {
                    console.log('mergeUnpayitems', data);
                }
            }
        }

        this.unPayItems = [];
        this.pstNo = '';

        return data;
    }
}