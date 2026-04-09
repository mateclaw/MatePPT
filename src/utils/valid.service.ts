
import { ValidResult } from './models/validResult';
import { ValidRule } from './models/validRule';
import * as $_ from 'lodash';
import { ValidType } from './models/valid-type';
import { isBoolean } from "lodash";
// import { Utils } from "@/utils/utils";


export class ValidService {

    private static instance: ValidService = new ValidService(

    );
    protected validResults: ValidResult[];
    public static getInstance() {
        return ValidService.instance;
    }


    // 验证是否为空
    public static isEmpty(chkValue): boolean {
        
        return !$_.isNumber(chkValue) && $_.isEmpty(chkValue) && !isBoolean(chkValue);
    }

    // 验证数字跟英文字母
    public static isNumberAndLetter(chkValue: string): boolean {
        if (chkValue) {
            return /^[0-9a-zA-Z]+$/.test(chkValue) ? true : false;
        } else {
            return true;
        }
    }

    // 验证是否为数字
    public static isNumber(chkValue: string): boolean {
        if (chkValue) {
            return /^(-?\d+)(\.\d+)?$/.test(chkValue) ? true : false;
        } else {
            return true;
        }

    }

    // 验证是否为数字
    public static isInt(chkValue: string): boolean {
        if (chkValue) {
            return /^-?[0-9]*$/.test(chkValue) ? true : false;
        } else {
            return true;
        }

    }

    // 验证是否为电话号码
    public static isTel(chkValue: string): boolean {
        if (chkValue) {
            return /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/.test(chkValue) ? true : false;
        } else {
            return true;
        }
    }

    public static isJsonText(chkValue: string): boolean {
        if (chkValue) {
            // const res = Utils.parseJsonWithValidation(chkValue);
            try {
                const res = JSON.parse(chkValue);

                if ($_.isArrayLike(res)) {
                    return true;
                }
                else if ($_.isObjectLike(res)) {
                    return true;
                }
            } catch (e) {
                return false;
            }

            return false;
        } else {
            return true;
        }
    }

    // 验证是否为日期
    public static isDate(chkValue: string): boolean {
        if (chkValue) {
            return $_.isDate(chkValue);
        } else {
            return true;
        }
    }

    // 验证是否为邮件格式
    public static isEmail(chkValue: string): boolean {
        if (chkValue) {
            return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(chkValue) ? true : false;
        } else {
            return true;
        }
    }

    // 验证是否超过最大长度
    public static overMaxLength(chkValue: string, maxLength: number) {
        if (!chkValue) {
            return null;
        }
        if (chkValue.length > maxLength) {
            return true;
        }
        return false;
    }
    public elCheck(field: ValidRule) {
        let validResult: ValidResult = null;

        return (rule: any, value: any) => {

            field.value = value;
            for (const type of field.types) {

                validResult = this.getCheckResult(field, type);
                if (!validResult.result && validResult.message) {
                    return Promise.reject(new Error(validResult.message));
                }

            }


            return Promise.resolve();

            // if (value === '') {
            //   callback(new Error('请输入密码'));
            // } else {
            //   if (this.ruleForm.checkPass !== '') {
            //     this.$refs.ruleForm.validateField('checkPass');
            //   }
            //   callback();
            // }
        };
    }

    public convertCheck<T>(fields: ValidRule[]): Record<keyof T, any> {
        const entries =
            fields.map((value) => {
                return [value.field, {
                    trigger: "blur",
                    validator: this.elCheck(value),
                    required: value.types.includes(ValidType.REQUIRED) || value.types.includes(ValidType.REQUIREDSELECT)
                }]
            });

        return Object.fromEntries(entries);
    }


    // 根据需校验的类型 对字段进行校验 返回校验结果
    public check(field: ValidRule): ValidResult[] {
        this.validResults = [];
        for (const type of field.types) {
            // if (type instanceof Array) {
            //     this.validResults.push(this.getCheckResult(field, type[0], type[1]));
            // } else {
            this.validResults.push(this.getCheckResult(field, type));
            // }
        }
        return this.validResults;
    }
    protected getCheckResult(field: ValidRule, validType: any): ValidResult {
        let type = null;
        if (validType instanceof Array) {
            type = validType[0];
        } else {
            type = validType;
        }
        switch (type) {
            case ValidType.REQUIRED:
                return {
                    result: !ValidService.isEmpty(field.value),
                    message: '请输入' + field.name,
                };
            case ValidType.REQUIREDSELECT:
                return {
                    result: !ValidService.isEmpty(field.value),
                    message: '请选择' + field.name,
                };
            case ValidType.NUMBER:
                return {
                    result: ValidService.isNumber(field.value),
                    message: field.name + '只能输入数字',
                };
            case ValidType.INT:
                return {
                    result: ValidService.isInt(field.value),
                    message: field.name + '只能输入整数',
                };
            case ValidType.NUMBERANDLETTER:
                return {
                    result: ValidService.isNumberAndLetter(field.value),
                    message: field.name + '只能输入英数字',
                };
            case ValidType.DATE:
                return {
                    result: ValidService.isDate(field.value),
                    message: '输入的' + field.name + '非日期格式',
                };
            case ValidType.MOBILE:
                return {
                    result: ValidService.isTel(field.value),
                    message: '输入的' + field.name + '非电话号码',
                };
            case ValidType.EMAIL:
                return {
                    result: ValidService.isEmail(field.value),
                    message: '输入的' + field.name + '非邮件格式',
                };
            case ValidType.JSONTEXT:
                return {
                    result: ValidService.isJsonText(field.value),
                    message: '输入的' + field.name + '非合法的JSON格式',
                };
            case ValidType.MAXLENGTH:
                return {
                    result: !ValidService.overMaxLength(field.value, validType[1]),
                    message: field.name + '已超出最大长度限制',
                };
            case ValidType.CUSTOM:
                if (typeof validType[1] === 'function') {
                    return {
                        result: validType[1](field.value),
                        message: validType[2],
                    };
                } else {
                    return new ValidResult();
                }
            default:
                return new ValidResult();
        }
    }

}
