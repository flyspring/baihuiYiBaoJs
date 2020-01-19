!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.BaiHuiYiBao=e():t.BaiHuiYiBao=e()}(window,function(){return function(t){var e={};function o(n){if(e[n])return e[n].exports;var s=e[n]={i:n,l:!1,exports:{}};return t[n].call(s.exports,s,s.exports,o),s.l=!0,s.exports}return o.m=t,o.c=e,o.d=function(t,e,n){o.o(t,e)||Object.defineProperty(t,e,{configurable:!1,enumerable:!0,get:n})},o.r=function(t){Object.defineProperty(t,"__esModule",{value:!0})},o.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return o.d(e,"a",e),e},o.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},o.p="",o(o.s=1)}([function(t,e,o){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var n=function(){function t(t,e,o){void 0===e&&(e="8000"),void 0===o&&(o=!1),this.ip="",this.port="",this.url="",this.reqStatus=!1,this.connected=!1,this.ip=""==t?"localhost":t,this.port=""==e?"8000":e,this.debug=o,this.connected=!1,this.reqStatus=!1,this.websocket=!1,this.handler=!1}return t.prototype.connect=function(){var t=this;return!!this.isConnected()||(this.websocket&&(this.websocket=!1),this.websocket||(this.websocket=new WebSocket(this.getUrl()),this.websocket.onopen=function(e){t.debug&&console.log("onopen",e),t.handler&&t.handler({cmd:"HS_CONNECTED",rst:!0,data:'{msg:"connect successfully"}'})},this.websocket.onerror=function(e){t.debug&&console.log("onerror",e),t.handler&&t.handler({cmd:"HS_ERROR",rst:!0,data:'{msg:"connect error"}'})},this.websocket.onmessage=function(e){t.debug&&console.log("onmessage",e),t.setReqStatus(!1);var o=e.data.indexOf(">"),n=e.data.substring(0,o),s=e.data.substring(o+1,e.data.length),i="T:"==s.substring(0,2),r=s=s.substring(2,s.length);try{i&&""!=s&&(r=JSON.parse(s))}catch(t){}t.handler&&t.handler({cmd:n,rst:i,data:r})},this.websocket.onclose=function(e){t.debug&&console.log("onclose",e),t.connected=!1,t.handler&&t.handler({cmd:"HS_DISCONNECTED",rst:!0,data:'{msg:"connect closed"}'})}),this.setConnected(!0),this.setReqStatus(!1),!0)},t.prototype.sendMsg=function(t,e,o){return this.isConnected()?this.getReqStatus()?{code:3,msg:"有请求未处理完，请稍后重试"}:(this.setReqStatus(!0),this.websocket.send(t+":"+e+">"+o),{code:1,msg:"发送成功"}):{code:2,msg:"HIS链接中断需要重新连接"}},t.prototype.setHandler=function(t){this.handler=t},t.prototype.getReqStatus=function(){return this.reqStatus},t.prototype.setReqStatus=function(t){this.reqStatus=t},t.prototype.isConnected=function(){return this.websocket&&this.connected},t.prototype.setConnected=function(t){this.connected=t},t.prototype.getUrl=function(){return""==this.url&&(this.url="ws://"+this.ip+":"+this.port+"/"),this.url},t}();e.Connection=n},function(t,e,o){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var n=o(0),s=function(){function t(t,e){this.unPayItems=[],this.pstNo="",this.ybType=t,this.setOptions(e),this.defaultCallbacks={HS_CONNECTED:this.init,RST_INIT:this.login,HS_DISCONNECTED:this.close,HS_ERROR:this.error},this.callbacks={RST_LOGIN:!1,RST_READ_CARD:!1,RST_REGISTRATION:!1,RST_CALC_REG:!1,RST_CALC_PST:!1,RST_PAY_REG:!1,RST_PAY_PST:!1}}return t.prototype.connect=function(){var t=this;if(this.connection&&this.connection.isConnected()){var e=this.getCallback("RST_LOGIN");return e?e(this.ybType,!0,""):this.ready(!0,""),!0}this.connection=new n.Connection(this.options.ip,this.options.port,this.options.debug),this.connection.setHandler(function(e){if(!e||!e.cmd)return!1;var o=t.getDefaultCallback(e.cmd);o?o.call(t,e.rst,e.data):(o=t.getCallback(e.cmd))&&("RST_CALC_PST"!=e.cmd&&"RST_PAY_PST"!=e.cmd||(e.data=t.mergeUnpayitems(e.data)),o(t.ybType,e.rst,e.data))}),this.connection.connect()},t.prototype.setOptions=function(t){this.options={ip:t.ip||"localhost",port:t.port||"8000",debug:t.debug||!1,userName:t.userName||"",userId:t.userId||"",yibao:t.yibao||{}}},t.prototype.init=function(t,e){return t?this.options.yibao.医院编码?void this.sendMsg("REQ_INIT",this.options.yibao):(this.options.debug&&console.log("初始化医保参数有误"),!1):(console.log("链接失败，无法进行初始化操作"),!1)},t.prototype.login=function(t,e){if(!t)return console.log("init初始化失败，无法进行后续登录签到操作"),!1;if(!this.options.userName||!this.options.userId)return alert("医保登录失败，缺少操作名或者操作人编号"),!1;var o={"操作员编号":this.options.userId,"操作员姓名":this.options.userName};this.sendMsg("REQ_LOGIN",o)},t.prototype.ready=function(t,e){if(!t)return console.log(this.ybType+": 登录签到失败"),!1;console.log(this.ybType+": 登录签到成功，业务周期编号："+e)},t.prototype.close=function(t,e){console.log(this.ybType+": 链接断开"),alert(this.ybType+": 链接医保助手已断开")},t.prototype.error=function(t,e){alert(this.ybType+": 链接医保助手出现异常，请确保医保助手已经启动")},t.prototype.readCard=function(t){this.options.debug&&console.log("正在请求读卡",t),this.sendMsg("REQ_READ_CARD","")},t.prototype.register=function(t){this.options.debug&&console.log("正在请求登记",t),this.sendMsg("REQ_REGISTRATION",t)},t.prototype.tryCalc=function(t,e){if("PST"==(t=t.toUpperCase())||"REG"==t){if(this.options.debug&&console.log("正在试算",e),e["处方信息"]){var o=this.getEnabledCalcItems(e["处方信息"]);if(0==o.length){var n=this.getCallback("RST_CALC_PST");return n?n(this.ybType,!1,"处方里的药材全都没有医保编号，请选择其他支付方式"):alert("处方里的药材全都没有医保编号，请选择其他支付方式"),!1}e["处方信息"]=o}this.sendMsg("REQ_CALC_"+t,e)}else console.log("试算参数有误")},t.prototype.payCalc=function(t,e){if("PST"==(t=t.toUpperCase())||"REG"==t){if(this.options.debug&&console.log("正在结算",e),e["处方信息"]){var o=this.getEnabledCalcItems(e["处方信息"]);if(0==o.length){var n=this.getCallback("RST_CALC_PST");return n?n(this.ybType,!1,"处方里的药材全都没有医保编号，请选择其他支付方式"):alert("处方里的药材全都没有医保编号，请选择其他支付方式"),!1}e["处方信息"]=o}this.sendMsg("REQ_PAY_"+t,e)}else console.log("结算参数有误")},t.prototype.cancel=function(t,e){"PST"==(t=t.toUpperCase())||"REG"==t?(this.options.debug&&console.log("正在撤销处方",e),this.sendMsg("REQ_CANCEL_"+t,e)):console.log("撤销处方参数有误")},t.prototype.refund=function(t,e){"PST"==(t=t.toUpperCase())||"REG"==t?(this.options.debug&&console.log("正在撤销结算",e),this.sendMsg("REQ_REFUND_"+t,e)):console.log("撤销结算参数有误")},t.prototype.setCallbacks=function(t){var e=this;t.forEach(function(t){t.cmd&&t.callback&&e.setCallback(t.cmd,t.callback)})},t.prototype.setCallback=function(t,e){t="RST_"+t.toUpperCase(),this.callbacks[t]=e},t.prototype.getDefaultCallback=function(t){return this.getHandler(this.defaultCallbacks,t)},t.prototype.getCallback=function(t){return this.getHandler(this.callbacks,t)},t.prototype.getHandler=function(t,e){return!(!t||!t[e])&&t[e]},t.prototype.sendMsg=function(t,e){e&&(e=JSON.stringify(e));var o=this.connection.sendMsg(this.ybType,t,e);return 1==o.code||(alert(o.msg),!1)},t.prototype.getEnabledCalcItems=function(t){if(0==t.length)return[];this.pstNo="",this.unPayItems=[];for(var e=[],o=0;o<t.length;o++)""==t[o]["项目自编码"]?this.unPayItems.push(t[o]):e.push(t[o]);return e.length>0&&(this.pstNo=e[e.length-1]["处方号"]),this.options.debug&&console.log("unPayItems",this.unPayItems),e},t.prototype.mergeUnpayitems=function(t){if(t["明细详情"]&&t["明细详情"].length>0&&this.unPayItems.length>0){var e=t["明细详情"].length;if(t["明细详情"][e-1]["处方号"]==this.pstNo){for(var o=0,n=0;n<this.unPayItems.length;n++){var s=this.unPayItems[n]["金额"]*this.unPayItems[n]["付数"];o+=s,t["明细详情"].push({"处方号":this.unPayItems[n]["处方号"],"处方号流水号":this.unPayItems[n]["流水号"],"金额":s.toFixed(3)+"","明细结果":"成功","项目等级":"","项目名称":this.unPayItems[n]["项目名称"],"项目自编码":"","支付上限":"","自付比例":"1.0","自付金额":s.toFixed(3)+"","自理金额":"0.0"})}t["明细详情"].sort(function(t,e){return t["处方号流水号"]-e["处方号流水号"]}),t["支付详情"]["医保现金"]=(1*t["支付详情"]["医保现金"]+o).toFixed(2)+"",this.options.debug&&console.log("mergeUnpayitems",t)}}return this.unPayItems=[],this.pstNo="",t},t}();e.BaiHuiYiBaoJs=s}])});