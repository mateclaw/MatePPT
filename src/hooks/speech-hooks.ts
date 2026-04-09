import { useWebSocket, useLatest, useInterval } from "ahooks";
import $_, { set } from 'lodash'
import { Recorder } from "@/lib/recorder";



import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export enum ReadyState {
    Connecting = 0,
    Open = 1,
    Closing = 2,
    Closed = 3,
}

export interface SpeeschProps {
    url?: string;
    onResult?: (result: string) => void;

}

/**
 * 
 * {"is_final":false,"mode":"2pass-online","text":"锄禾","wav_name":"h5"}
 * {"is_final":false,"mode":"2pass-online","text":"日当","wav_name":"h5"}
 * {"is_final":false,"mode":"2pass-online","text":"午","wav_name":"h5"}
 * {"is_final":false,"mode":"2pass-online","text":"汗","wav_name":"h5"}
 * {"is_final":false,"mode":"2pass-online","text":"滴禾","wav_name":"h5"}
 * {"is_final":false,"mode":"2pass-online","text":"下","wav_name":"h5"}
 * {"is_final":false,"mode":"2pass-offline","stamp_sents":[{"end":2090,"punc":"，","start":410,"text_seg":"锄 禾 日 当 午","ts_list":[[410,730],[730,1050],[1050,1250],[1250,1490],[1490,2090]]},{"end":3754,"punc":"","start":2209,"text_seg":"汗 滴 禾 下 土","ts_list":[[2209,2550],[2550,2889],[2889,3129],[3129,3429],[3429,3754]]}],"text":"锄禾日当午，汗滴禾下土","timestamp":"[[410,730],[730,1050],[1050,1250],[1250,1490],[1490,2090],[2209,2550],[2550,2889],[2889,3129],[3129,3429],[3429,3754]]","wav_name":"h5"}
 * {"is_final":false,"mode":"2pass-online","text":"谁知","wav_name":"h5"}
 * {"is_final":false,"mode":"2pass-online","text":"盘中","wav_name":"h5"}
 * {"is_final":false,"mode":"2pass-online","text":"餐","wav_name":"h5"}
 * {"is_final":false,"mode":"2pass-offline","stamp_sents":[{"end":-1,"punc":"，","start":-1,"text_seg":"","ts_list":[]},{"end":5935,"punc":"","start":4500,"text_seg":"谁 知 盘 中 餐","ts_list":[[4500,4780],[4780,5040],[5040,5300],[5300,5580],[5580,5935]]}],"text":"，谁知盘中餐","timestamp":"[[4500,4780],[4780,5040],[5040,5300],[5300,5580],[5580,5935]]","wav_name":"h5"}
 * {"is_final":false,"mode":"2pass-online","text":"丽","wav_name":"h5"}
 * {"is_final":false,"mode":"2pass-online","text":"粒皆","wav_name":"h5"}
 * {"is_final":false,"mode":"2pass-online","text":"辛","wav_name":"h5"}
 * {"is_final":false,"mode":"2pass-offline","stamp_sents":[{"end":-1,"punc":"，","start":-1,"text_seg":"","ts_list":[]},{"end":7815,"punc":"","start":6640,"text_seg":"粒 粒 皆 辛 苦","ts_list":[[6640,6780],[6780,7140],[7140,7380],[7380,7580],[7580,7815]]}],"text":"，粒粒皆辛苦","timestamp":"[[6640,6780],[6780,7140],[7140,7380],[7380,7580],[7580,7815]]","wav_name":"h5"}
 * {"is_final":true,"text":"","wav_name":"h5"}
 */

interface StampSents {
    end: number;
    punc: string;
    start: number;
    text_seg: string;
    ts_list: number[][];
}
interface FunAsrResult {
    text: string;
    mode: string;
    is_final: boolean;
    timestamp: string;
    stamp_sents: StampSents[];
    chunk_size: number;
    wav_name: string;
    is_speaking: boolean;
    chunk_interval: number;
    itn: boolean;
}





export function useSpeech(props: SpeeschProps = { url: '' }) {
    const { url } = props;

    const [isRecording, setIsRecording] = useState(false);
    const isRecordingRef = useLatest(isRecording);
    const sampleBuf = useRef<Int16Array>(new Int16Array());
    const [delay, setDelay] = useState<number | undefined>(5000);

    const startTimeRef = useRef<number>(Date.now())
    const lastActiveTimeRef = useRef<number>(Date.now())





    // 在useSpeech中添加状态管理
    const [finalText, setFinalText] = useState(''); // 最终确认文本
    const [interimText, setInterimText] = useState(''); // 临时中间结果

    const wsHandler = useWebSocket(
        // 'wss://www.funasr.com:10095',
        url || '/speech',
        {
            manual: true,
            reconnectLimit: 0,
            onOpen(event, instance) {

                setTimeout(() => {

                    onOpen();
                    onConnect();
                }, 100);

            },

            onMessage: (message) => {
                try {
                    const result: FunAsrResult = JSON.parse(message.data);

                    if (result.text) {

                        lastActiveTimeRef.current = Date.now(); // 更新最后活动时间
                        // ...原有处理逻辑...

                    }

                    // 处理2pass-online临时结果
                    if (result.mode === '2pass-online' && !result.is_final) {
                        setInterimText(prev => {
                            // 在线模式逐步追加临时文本
                            const newText = prev + result.text;
                            // 去除可能的重复叠加（根据业务逻辑调整）
                            // return newText.replace(/(.)\1{2,}/g, '$1');
                            return newText;
                        });
                    }

                    // 处理2pass-offline半最终结果
                    if (result.mode === '2pass-offline') {
                        setFinalText(prev => {
                            // 离线结果通常更准确，替换之前的临时内容
                            const cleanText = prev.replace(interimText, '');
                            return cleanText + result.text;
                        });
                        setInterimText(''); // 清空临时结果
                    }

                    // 处理最终确认结果
                    if (result.is_final) {
                        setFinalText(prev => prev + interimText);
                        setInterimText('');
                        // 可以在这里触发最终结果处理逻辑
                    }
                } catch (err) {
                    console.error('ASR结果解析失败', err);
                }
            },
            onClose(event, instance) {
                setIsRecording(false)

            },
            onError(event, instance) {
                console.log('[DEBUG] WebSocket error:', event);
                console.log('[DEBUG] WebSocket error:', instance);
                setIsRecording(false);
                rec.current.stop();
            },
        }
    );

    // 正确使用 useInterval 的方式（直接调用）
    const clear = useInterval(() => {

        if (isRecording) {
            const currentTime = Date.now();
            if (currentTime - lastActiveTimeRef.current > 3000) {
                stopRecord();
                console.log('3秒无活动自动停止');
            }
            if (currentTime - startTimeRef.current > 60000) {
                stopRecord();
                console.log('1分钟自动停止');
            }
        }
    }, 1000);

    const onOpen = () => {
        var chunk_size = new Array(5, 10, 5);
        var request = {
            "chunk_size": chunk_size,
            "wav_name": "h5",
            "is_speaking": true,
            "chunk_interval": 10,
            "itn": false,
            "mode": "2pass",
            // "hotwords": { "阿里巴巴": 20, "hello world": 40 }
        };


        // var hotwords=getHotwords();

        // if(hotwords!=null  )
        // {
        // 	request.hotwords=hotwords;
        // }

        wsHandler.sendMessage(JSON.stringify(request));

    }

    const recProcess = (buffer, powerLevel, bufferDuration, bufferSampleRate, newBufferIdx, asyncEnd) => {
        // console.log('[DEBUG] recProcess', buffer, powerLevel, bufferDuration, bufferSampleRate, newBufferIdx, asyncEnd);
        if (isRecordingRef.current === true) {
            var data_48k = buffer[buffer.length - 1];

            var array_48k = new Array(data_48k);
            var data_16k = Recorder.SampleData(array_48k, bufferSampleRate, 16000).data;

            sampleBuf.current = Int16Array.from([...sampleBuf.current, ...data_16k]);
            var chunk_size = 960; // for asr chunk_size [5, 10, 5]
            // info_div.innerHTML=""+bufferDuration/1000+"s";
            while (sampleBuf.current.length >= chunk_size) {
                const sendBuf = sampleBuf.current.slice(0, chunk_size);
                sampleBuf.current = sampleBuf.current.slice(chunk_size, sampleBuf.current.length);
                wsHandler.sendMessage(sendBuf);
            }



        }
    }

    const rec = useRef(Recorder({
        type: "pcm",
        bitRate: 16,
        sampleRate: 16000,
        onProcess: recProcess
    }));

    const isConnecting = useMemo(() => {
        return wsHandler.readyState === ReadyState.Connecting;
    }, [wsHandler.readyState]);
    const isConnected = useMemo(() => {
        return wsHandler.readyState === ReadyState.Open && !isRecording;
    }, [wsHandler.readyState,isRecording]);


    const cacheText = useRef('');


    const startRecord = (text?: string) => {
        cacheText.current = text || '';
        if (text) {
            setFinalText(text);
        }
        else {
            setFinalText('');
        }
        setInterimText('');
        startTimeRef.current = Date.now();
        lastActiveTimeRef.current = Date.now();
        if (wsHandler.readyState !== ReadyState.Open) {
            wsHandler.connect();
        }

    }



    useEffect(() => {
        if ((interimText || finalText) && props.onResult) {

            props.onResult(finalText + interimText);
        }


    }, [interimText, finalText]);



    const onConnect = () => {
        setIsRecording(true);

        rec.current.open(function () {
            rec.current.start();
        });

    }

    const stopRecord = () => {
        setIsRecording(false);
        if (wsHandler.readyState !== ReadyState.Open) {
            return;
        }
        var chunk_size = new Array(5, 10, 5);
        var request = {
            "chunk_size": chunk_size,
            "wav_name": "h5",
            "is_speaking": false,
            "chunk_interval": 10,
            "mode": '2pass',
        };

        if (sampleBuf.current.length > 0) {
            wsHandler.sendMessage(sampleBuf.current);
            // console.log("sampleBuf.length" + sampleBuf.current.length);
            sampleBuf.current = new Int16Array();
        }
        wsHandler.sendMessage(JSON.stringify(request));


        // 控件状态更新
        //wait 3s for asr result
        setTimeout(function () {
            wsHandler.disconnect();
        }, 1000);



        rec.current.stop(function (blob, duration) {


            // var audioBlob = Recorder.pcm2wav({ sampleRate: 16000, bitRate: 16, blob: blob },
            //     function (theblob, duration) {
            //         console.log(theblob);
            //         var audio_record = document.getElementById('audioId') as HTMLAudioElement;
            //         audio_record.src = (window.URL || webkitURL).createObjectURL(theblob);
            //         audio_record.controls = true;
            //         audio_record.play();


            //     }, function (msg) {
            //         console.log(msg);
            //     }
            // );



        }, function (errMsg) {
            console.log("errMsg: " + errMsg);
        });

    }



    return {
        wsHandler,
        startRecord,
        stopRecord,
        isRecording,
        finalText,
        interimText,
        isConnecting,
        isConnected,
    };
}
