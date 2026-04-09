import AES from 'crypto-js/aes';
import Utf8 from "crypto-js/enc-utf8";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { history } from "umi";
export const serializer = {
    read: (v: any) => {
        let res = null;

        if (!v) {
            return res;
        }
        try {
            const str = AES.decrypt(v, STORAGE_KEYS.C_Key).toString(Utf8);
            res = JSON.parse(str);
        }
        catch (error) {
            history.push('/login');
            console.error(error);
        }
        return res;

    },
    write: (v: any) => {
        // 将对象转换为字符串
        const jsonString = JSON.stringify(v);
        // 将字符串转换为 WordArray 对象
        const data = Utf8.parse(jsonString);
        return AES.encrypt(data, STORAGE_KEYS.C_Key).toString();
    },
}

// // AES 加密
// export const encrypt = (data: string) => {
//     return CryptoJS.AES.encrypt(data, STORAGE_KEYS.C_Key).toString()
//   }

//   // AES 解密
//   export const decrypt = (ciphertext: string) => {
//     const bytes = CryptoJS.AES.decrypt(ciphertext, STORAGE_KEYS.C_Key)
//     return bytes.toString(CryptoJS.enc.Utf8)
//   }

// 安全 localStorage 操作
export const secureStorage = {
    getItem: (key: string) => {
        const data = localStorage.getItem(key)
        return data ? serializer.read(data) : null
    },
    setItem: (key: string, value: string) => {
        localStorage.setItem(key, serializer.write(value))
    },
    removeItem: (key: string) => {
        localStorage.removeItem(key)
    }
}