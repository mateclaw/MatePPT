import {Observable} from 'rxjs';

import {RSResult} from '../models/common/rSResult';
import {HttpClientService} from './httpClient.service';
import {BaseService} from './base.service';

import {OrderPo} from '../models/orderPo';

/**
 *
 *  OrderService Interface (Auto generated code)

 *  @Author bubuxiu@gmail.com
 *
 */

export class OrderService extends BaseService<OrderPo> {
    private static instance:OrderService = new OrderService(HttpClientService.getInstance());
    public static getInstance() {
        return OrderService.instance;
    }

    constructor(protected httpClientService: HttpClientService) {
        super();
    }
    /**
     * 根据业务主键（orderId）查询详情
     *  请求参数：
     *     orderId，必填
     * 响应结果：
     *     OrderPo
     *
     */
    public detail(param: OrderPo): Observable<RSResult<any>> {
        const url = '/aippt/api/order/detail';
        return this.httpClientService.post(url, param);
    }

    /**
     * 分页查询列表（不返回内部id）
     *
     */
    public list(param: OrderPo): Observable<RSResult<any>> {
        const url = '/aippt/api/order/list';
        return this.httpClientService.post(url, param);
    }

    /**
     * 微信扫码支付（Native）
     * 场景：商家提供二维码，用户用微信“扫一扫”完成支付
     * 文档参考：Native下单 v3
     *
     * 必填参数：
     *     planId：套餐id
     *     payCycle：monthly、yearly、lifetime
     *     payType：支付类型，WechatPay、AliPay、UnionPay、Stripe、PayPal
     *
     * 可选参数：
     *     userId：用户id - 从令牌读取
     *     userName：用户名称 - 从令牌读取
     *     orderTotal：订单金额（分）- 从planId套餐读取
     *     mobile、email、address
     * 返回：
     *     Map<String, Object>
     *         包含：orderId、codeUrl、expireSeconds
     * 说明：
     *     实际是否金额 = orderTotal  套餐的折扣率/100 （根据planId对应的套餐计算）
     *
     */
    public nativeOrder(param: OrderPo): Observable<RSResult<any>> {
        const url = '/aippt/api/order/wxpay/native';
        return this.httpClientService.post(url, param);
    }

    /**
     * 微信订单状态查询请求
     * 参数：
     *     orderId，订单号
     * 返回：
     *     OrderPo
     *
     *     参考：https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_1_2.shtml
     *
     *     需要调用查询接口的情况：
     *     • 当商户后台、网络、服务器等出现异常，商户系统最终未接收到支付通知。
     *     • 调用支付接口后，返回系统错误或未知交易状态情况。
     *     • 调用付款码支付API，返回USERPAYING的状态。
     *     • 调用关单或撤销接口API之前，需确认支付状态。
     *
     */
    public wxpayOrderQuery(param: OrderPo): Observable<RSResult<any>> {
        const url = '/aippt/api/order/wxpay/orderQuery';
        return this.httpClientService.post(url, param);
    }

    /**
     * ！！！ 注意，这个接口是给微信支付回调用的 ！！！
     * 微信支付成功后，异步通知接口
     * 要求必须为https地址
     * 返回：
     *     按照微信支付通知要求返回
     *
     * https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_1_5.shtml
     *
     * 参数大于1的非GET请求，跳过此接口方法（/aippt/api/order/wxpay/notify_url）的代码生成
     */

}

