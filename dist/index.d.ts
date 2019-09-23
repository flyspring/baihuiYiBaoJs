export declare class BaiHuiYiBaoJs {
    private ybType;
    private connection;
    private options;
    private callbacks;
    private defaultCallbacks;
    private unPayItems;
    private pstNo;
    constructor(ybType: string, options?: any);
    /**
     * connect yibao
     */
    connect(): boolean;
    /**
     * set options
     * @param options
     */
    protected setOptions(options: any): void;
    /**
     * 链接后进行初始化操作
     * @param rst
     * @param data
     */
    protected init(rst: boolean, data: any): boolean;
    /**
     * 完成初始化后登陆
     * @param rst
     * @param data
     */
    protected login(rst: boolean, data: any): boolean;
    /**
     * 完成登录准备
     * @param rst
     * @param data
     */
    protected ready(rst: boolean, data: any): boolean;
    /**
     * 链接断开
     * @param rst
     * @param data
     */
    protected close(rst: boolean, data: any): void;
    /**
     * 出现错误
     * @param ybType
     * @param data
     */
    protected error(rst: boolean, data: any): void;
    /**
     * 读卡
     * @param data
     */
    readCard(data?: any): void;
    /**
     * register
     * @param data
     */
    register(data?: any): void;
    /**
     * try calc
     * @param type PST, REG
     * @param data
     */
    tryCalc(type: string, data?: any): boolean;
    /**
     * pay calc
     * @param type PST, REG
     * @param data
     */
    payCalc(type: string, data?: any): boolean;
    /**
     * 取消门诊号下所有未结算方案
     * 因为试算时，上传了处方信息，
     * 如果不结算的话，把此门诊号下的未结算处方撤销
     * @param type
     * @param data
     */
    cancel(type: string, data?: any): void;
    /**
     * refund
     * @param type
     * @param data
     */
    refund(type: string, data?: any): void;
    /**
     * set callbacks
     * @param callbacks
     */
    setCallbacks(callbacks: Array<{
        cmd: string;
        callback: (ybType: string, rst: boolean, data: any) => any;
    }>): void;
    /**
     * set callback
     * @param cmd
     * @param callback
     */
    setCallback(cmd: string, callback: (ybType: string, rst: boolean, data: any) => any): void;
    /**
     * get default callback
     * @param cmd
     */
    protected getDefaultCallback(cmd: string): any;
    /**
     * get callback
     * @param cmd
     */
    protected getCallback(cmd: string): any;
    /**
     * get handler
     * @param callbacks
     * @param cmd
     */
    protected getHandler(callbacks: {}, cmd: string): any;
    /**
     * send msg
     * @param event
     * @param data
     */
    protected sendMsg(event: string, data: any): boolean;
    /**
     * get enabled calc Items
     * @param data
     */
    protected getEnabledCalcItems(items: any): any[];
    /**
     * merge unpay items
     */
    protected mergeUnpayitems(data: any): any;
}
