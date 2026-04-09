import {Observable} from 'rxjs';

import {RSResult} from '../models/common/rSResult';
import {HttpClientService} from './httpClient.service';
import {BaseService} from './base.service';

import {UserPo} from '../models/userPo';
import {OtpCodePo} from '../models/otpCodePo';

/**
 *
 *  UserService Interface (Auto generated code)

 *  @Author bubuxiu@gmail.com
 *
 */

export class UserService extends BaseService<UserPo> {
    private static instance:UserService = new UserService(HttpClientService.getInstance());
    public static getInstance() {
        return UserService.instance;
    }

    constructor(protected httpClientService: HttpClientService) {
        super();
    }
    /**
     * 账号密码登陆
     * 参数：
     *      email 、password必填
     * 返回：
     *     UserPo
     *
     */
    public accountLogin(param: UserPo): Observable<RSResult<any>> {
        const url = '/aippt/api/user/account/login';
        return this.httpClientService.post(url, param);
    }

    /**
     * 后台手动添加
     *  email、password必填
     *
     */
    public add(param: UserPo): Observable<RSResult<any>> {
        const url = '/aippt/api/user/new';
        return this.httpClientService.post(url, param);
    }

    /**
     * 用户账号冻结
     *
     * 参数：
     *   userId，必填
     *   blockReason: 必填
     *
     */
    public block(user: UserPo): Observable<RSResult<any>> {
        const url = '/aippt/api/user/block';
        return this.httpClientService.post(url, user);
    }

    /**
     * 根据主键删除记录 (Auto generated code)
     *
     */
    public delete(param: UserPo): Observable<RSResult<any>> {
        const url = '/aippt/api/user/delete';
        return this.httpClientService.post(url, param);
    }

    /**
     * 根据主键查询详情 (Auto generated code)
     *
     */
    public detail(param: UserPo): Observable<RSResult<any>> {
        const url = '/aippt/api/user/detail';
        return this.httpClientService.post(url, param);
    }

    /**
     * GitHub 账号登录
     * 参数：
     *     code  必填（OAuth 授权码）
     * 返回：
     *     UserPo
     *
     */
    public githubLogin(param: UserPo): Observable<RSResult<any>> {
        const url = '/aippt/api/user/github/login';
        return this.httpClientService.post(url, param);
    }

    /**
     * Google 账号登录
     * 参数：
     *     code  必填（OAuth 授权码）
     * 返回：
     *     UserPo
     *
     */
    public googleLogin(param: UserPo): Observable<RSResult<any>> {
        const url = '/aippt/api/user/google/login';
        return this.httpClientService.post(url, param);
    }

    /**
     * 分页查询列表 (Auto generated code)
     *
     */
    public list(param: UserPo): Observable<RSResult<any>> {
        const url = '/aippt/api/user/list';
        return this.httpClientService.post(url, param);
    }

    /**
     * 退出登录
     *
     * 参数：
     *     userId，必填
     *
     */
    public logout(user: UserPo): Observable<RSResult<any>> {
        const url = '/aippt/api/user/logout';
        return this.httpClientService.post(url, user);
    }

    /**
     * 查询当前用户订阅情况（当前有效权益）
     *
     * 参数：
     *     {}，使用 token 中的 userId
     * 返回：
     *     List<UserSubscriptionVo>
     *
     */
    public querySubscription(user: UserPo): Observable<RSResult<any>> {
        const url = '/aippt/api/user/subscription/query';
        return this.httpClientService.post(url, user);
    }

    /**
     * 发送手机验证码
     *
     * 参数：
     *     channel，必填，内容固定为"sms"
     *     receiver，必填，内容填写手机号码
     *     purpose，必填，内容为login/register/reset_password等
     *
     */
    public sendMobileCheckCode(param: OtpCodePo): Observable<RSResult<any>> {
        const url = '/aippt/api/user/mobile/checkcode/send';
        return this.httpClientService.post(url, param);
    }

    /**
     * 手机短消息验证登陆
     * 参数：
     *        手机号码mobile ，必填
     *        验证码checkCode，必填
     *    返回：
     *     UserPo
     *
     */
    public smsLogin(param: UserPo): Observable<RSResult<any>> {
        const url = '/aippt/api/user/sms/login';
        return this.httpClientService.post(url, param);
    }

    /**
     * 解冻用户账户
     *
     * 参数：
     *     userId，必填
     *
     */
    public unblock(user: UserPo): Observable<RSResult<any>> {
        const url = '/aippt/api/user/unblock';
        return this.httpClientService.post(url, user);
    }

    /**
     * 根据主键更新记录 (Auto generated code)
     *
     */
    public update(param: UserPo): Observable<RSResult<any>> {
        const url = '/aippt/api/user/update';
        return this.httpClientService.post(url, param);
    }

    /**
     * 微信公众号菜单登陆
     *
     * 参数：
     *     code必填（前端wx接口获取的 code）
     * 返回：
     *     UserPo
     * 参考：
     *     https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html
     *
     */
    public wechatOffiaccountLogin(param: UserPo): Observable<RSResult<any>> {
        const url = '/aippt/api/user/wechat/offiaccount/login';
        return this.httpClientService.post(url, param);
    }

    /**
     * 微信网站扫码登陆；或OAuth2.0授权登录
     *
     * 参数：
     *     code必填（前端wx接口获取的 code）
     *
     * 返回：
     *     UserPo
     *
     * 参考：https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login.html
     *
     */
    public wechatWebappLogin(param: UserPo): Observable<RSResult<any>> {
        const url = '/aippt/api/user/wechat/webapp/login';
        return this.httpClientService.post(url, param);
    }

}

