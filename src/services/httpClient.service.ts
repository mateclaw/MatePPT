/* eslint-disable */
import axios, { type AxiosRequestHeaders } from "axios";
import { Observable } from "rxjs";
import { config } from "@/config";
import { history } from 'umi';
import { App } from 'antd';
import { getGlobalMessage } from '@/utils/message-utils';
import useUserStore from "@/stores/userStore";

/**
 * httpclient服务
 */
export class HttpClientService {

  private static instance: HttpClientService;
  /**
 * 获取服务的实例
 */
  public static getInstance(): HttpClientService {

    if (!this.instance) {
      this.instance = new HttpClientService();
      console.log('[DEBUG] HttpClientService initialized');
    }
    return this.instance;
  }
  private $service: any;
  private accessToken: string = '';
  private constructor() {

    const service = axios.create({

      adapter: 'fetch',
      baseURL: config.baseUrl, // process.env.VUE_APP_BASE_API, // api的base_url
      timeout: 1000 * 60 * 60, // request timeout
    });
    console.log('[DEBUG] HttpClientService baseURL', config.baseUrl);

    // request interceptor
    service.interceptors.request.use(
      async (config) => {

        // const { accessToken } = useUserStore();
        await import('@/stores/userStore').then((module) => {

          const useUserStore = module.default;
          const accessToken = useUserStore.getState().accessToken
          if (accessToken) {
            this.accessToken = accessToken;
          }

        });
        if (this.accessToken) {
          (config.headers as AxiosRequestHeaders)["User-Token"] = this.accessToken;
        }

        return config;
      },
      (error) => {
        Promise.reject(error);
      }
    );
    this.$service = service;
  }

  /**
   * post
   */
  public post(
    url: string,
    params?: any,
    config?: any,
    withoutCommonProcess = false
  ): Observable<any> {
    // this.spinService.spin(true);
    const result = Observable.create((observer: any) => {
      // const loading = Loading.service({ fullscreen: true });
      this.$service
        .post(url, params, config)
        .then((response: any) => {
          // loading.close();
          observer.next(response.data || null);
          observer.complete();
        })
        .catch((error: any) => {
          // loading.close();
          console.log("error");
          observer.error(error);
          observer.complete();
        });
    });

    result.getUrl = () => url;
    if (withoutCommonProcess) {
      return result;
    } else {
      const commonRes = this.commonProcess(result);
      (commonRes as any).getUrl = () => url;
      return commonRes;
    }
  }

  /**
   * get
   */
  public get(
    url: string,
    params?: any,
    withoutCommonProcess = false
  ): Observable<any> {
    // this.spinService.spin(true);
    const result = Observable.create((observer: any) => {
      // const loading = Loading.service({ fullscreen: true });
      this.$service
        .get(url, { params })
        .then((response: any) => {
          // loading.close();
          observer.next(response.data || null);
          observer.complete();
        })
        .catch((error: any) => {
          // loading.close();
          console.log("error");
          observer.error(error);
          observer.complete();
        });
    });
    if (withoutCommonProcess) {
      return result;
    } else {
      return this.commonProcess(result);
    }
  }

  public async commonHandlerError(res: any) {
    const message = getGlobalMessage();
    // message.error('Request failed!');


    // 会话过期
    if (res.code >= -10 && res.code <= -1) {
      message.error("会话过期，请重新登录");
      useUserStore.getState().resetAll();
      return;
    }
    message.error(res.msg || "请求失败");
  }

  /**
   * 公共处理
   * @param observable
   */
  public commonProcess(observable: Observable<any>): Observable<any> {
    return Observable.create((observer: any) => {
      observable.subscribe(
        (res) => {
          if (res.code !== 0) {
            observer.error(res);
            if (!res.handled) {
              this.commonHandlerError(res);
            }
          } else {
            observer.next(res);
          }
        },
        (err) => {
          const res = { code: -100, msg: err.statusText, handled: false };
          observer.error(res);
          if (!res.handled) {
            this.commonHandlerError(res);
          }
        },
        () => {
          observer.complete();
        }
      );
    });
  }
}


// 立即创建实例确保可用性
(() => {
  console.log('[DEBUG] HttpClientService initializing...');
  try {
    HttpClientService.getInstance();
  } catch (error) {
    console.error('Pre-initialization failed:', error);
  }
})();
