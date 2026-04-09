import { useReactive } from "ahooks";
import * as $_ from "lodash";
import { useLocation } from 'umi'
import { Observable, isObservable } from "rxjs";
import { RSResult } from "@/models/common/rSResult";
/**
 * name:"那么"
 */
export interface dictOptions {
    name: string,
    keyName?: string,
    valueName?: string,
    params?: Record<string, any>,
    dataSource: any,
    datas?: any[],
    dataMap?: Record<string, any>,
    getData?: any,
    // 给a-select用的
    fieldNames?: Record<string, any>,
    onDataLoaded?: (data: any) => any,
}
// useReactive()

export const useDict = () => {
    const dict = useReactive({
        addDict(options: dictOptions): dictOptions {
            // const path = router.currentRoute.value.fullPath;
            const path = location.pathname;
            const name = options.name.startsWith("/") ? options.name : path + "/" + options.name;
            // if (this.dicMap[name]) {
            //     // 避免重复添加
            //     return this.dicMap[name];
            // }
            this.dicMap[name] = options;
            this.dicMap[name].dataMap = {};
            //通过key获取value
            this.dicMap[name].getData = (key: string) => {
                const dataMap = (this.dicMap[name] as dictOptions).dataMap || {};
                return dataMap[key] ? dataMap[key][this.dicMap[name].valueName] : key;
            }
            //通过多个key获取value，逗号分隔
            this.dicMap[name].getMultiData = (key: string) => {
                const keyList = key.split(',');

                return keyList.map((v, i, arr) => { return this.dicMap[name].getData(v) }).join(',');
            }
            const { keyName = 'id', valueName = 'value' } = this.dicMap[name] as dictOptions;

            this.dicMap[name].fieldNames = { label: valueName, value: keyName }
            this.dicMap[name].keyName = keyName;
            this.dicMap[name].valueName = valueName

            if (isObservable(options.dataSource)) {
 
                this.dicMap[name].datas = [];
                (options.dataSource as Observable<RSResult<any>>).subscribe(res => {
                    this.dicMap[name].datas = res.data || [];
                    if (this.dicMap[name].onDataLoaded) {
                        const dealedData = this.dicMap[name].onDataLoaded(this.dicMap[name].datas);
                        if (dealedData) {
                            this.dicMap[name].datas = dealedData;
                        }
                    }
                    const { datas, dataMap } = this.dicMap[name] as dictOptions;
                    for (const key in datas) {
                        const element = datas[key];
                        dataMap[element[keyName]] = element;

                    }

                    
                });
            }
            else if ($_.isArray(options.dataSource)) {
                // 自定义数组

                this.dicMap[name].datas = [].concat(options.dataSource);
                if (this.dicMap[name].onDataLoaded) {

                    const dealedData = this.dicMap[name].onDataLoaded(this.dicMap[name].datas);
                    if (dealedData) {
                        this.dicMap[name].datas = dealedData;
                    }
                }
                const { datas, dataMap } = this.dicMap[name] as dictOptions;
                for (const key in datas) {
                    const element = datas[key];
                    dataMap[element[keyName]] = element;
                }
            }

            return this.dicMap[name];


        },
        getDict(dictName: string, key?: string) {
            const path = location.pathname;
            const name = dictName.startsWith("/") ? dictName : path + "/" + dictName;
            if (!key) {

                return this.dicMap[name]
            }
            else {
                const dataMap = (this.dicMap[name] as dictOptions).dataMap || {};

                return dataMap[key] ? dataMap[key][this.dicMap[name].valueName] : key;
            }
        },
        dicMap: {}

    });

    return { dict }
}

