import { Authorization } from '@/constants/authorization';
// import { getAuthorization } from '@/utils/authorization-util';
import jsPreviewExcel from '@js-preview/excel';
import axios from 'axios';
import mammoth from 'mammoth';
import { useCallback, useEffect, useRef, useState } from 'react';
import MateMarkdown from "@/components/base/mate-markdown";
import { Typography } from "antd";

export const useCatchError = (api: string) => {
  const [error, setError] = useState('');
  const fetchDocument = useCallback(async () => {
    const ret = await axios.get(api);
    const { data } = ret;
    if (!(data instanceof ArrayBuffer) && data.code !== 0) {
      setError(data.message);
    }
    return ret;
  }, [api]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  return { fetchDocument, error };
};

export const useFetchDocument = () => {
  const fetchDocument = useCallback(async (api: string) => {
    const ret = await axios.get(api, {
      headers: {
        // [Authorization]: getAuthorization(),
      },
      responseType: 'arraybuffer',
    });
    return ret;
  }, []);

  return { fetchDocument };
};

export const useFetchExcel = (filePath: string) => {
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const { fetchDocument } = useFetchDocument();
  const containerRef = useRef<HTMLDivElement>(null);
  const { error } = useCatchError(filePath);

  const fetchDocumentAsync = useCallback(async () => {
    let myExcelPreviewer;
    setLoading(true);
    if (containerRef.current) {
      myExcelPreviewer = jsPreviewExcel.init(containerRef.current);
    }
    const jsonFile = await fetchDocument(filePath);
    myExcelPreviewer
      ?.preview(jsonFile.data)
      .then(() => {
        console.log('succeed');
        setStatus(true);
      })
      .catch((e) => {
        console.warn('failed', e);
        myExcelPreviewer.destroy();
        setStatus(false);
      }).finally(() => {
        setLoading(false);
      });
  }, [filePath, fetchDocument]);

  useEffect(() => {
    fetchDocumentAsync();
  }, [fetchDocumentAsync]);

  return { status, containerRef, error, loading };
};

export const useFetchDocx = (filePath: string) => {
  const [succeed, setSucceed] = useState(true);
  const [error, setError] = useState<string>();
  const { fetchDocument } = useFetchDocument();
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchDocumentAsync = useCallback(async () => {
    try {
      setLoading(true);
      const jsonFile = await fetchDocument(filePath);
      const container = containerRef.current;
      
      if (container) {
        // container.innerHTML = docEl.outerHTML;
      }

      mammoth
        .convertToHtml(
          { arrayBuffer: jsonFile.data },
          { includeDefaultStyleMap: true },
        )
        .then((result) => {
          
          const docEl = document.createElement('div');
          docEl.className = 'document-container';
          docEl.innerHTML = result.value;
          const container = containerRef.current;
          if (container) {
            container.innerHTML = docEl.outerHTML;
          }
          
          setTimeout(()=>{

            setSucceed(true);
            setLoading(false);
          },100)
        })
        .catch(() => {
          setSucceed(false);
          setLoading(false);
        });
    } catch (error: any) {
      setError(error.toString());
    } 
  }, [filePath, fetchDocument]);

  useEffect(() => {
    fetchDocumentAsync();
  }, [fetchDocumentAsync]);

  return { succeed, containerRef, error, loading };
};

export const useFetchText = (filePath: string) => {
  const [succeed, setSucceed] = useState(true);
  const [error, setError] = useState<string>();
  const { fetchDocument } = useFetchDocument();
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState<string>();

  const fetchDocumentAsync = useCallback(async () => {
    try {
      setLoading(true);
      const jsonFile = await fetchDocument(filePath);
      


      // 新增文本处理逻辑
      const decoder = new TextDecoder('utf-8');
      const textContent = decoder.decode(jsonFile.data);

      setSucceed(true);

      setContent(textContent);
      // const container = containerRef.current;
      // if (container) {
      //   // 安全方式插入文本
      //   // container.textContent = textContent;

      //   // 或者使用带格式的 HTML（如果内容可信）
      //   container.innerHTML = textContent;

      // }
      // mammoth
      //   .convertToHtml(
      //     { arrayBuffer: jsonFile.data },
      //     { includeDefaultStyleMap: true },
      //   )
      //   .then((result) => {
      //     setSucceed(true);
      //     const docEl = document.createElement('div');
      //     docEl.className = 'document-container';
      //     docEl.innerHTML = result.value;
      //     const container = containerRef.current;
      //     if (container) {
      //       container.innerHTML = docEl.outerHTML;
      //     }
      //   })
      //   .catch(() => {
      //     setSucceed(false);
      //   });
    } catch (error: any) {
      setError(error.toString());
    } finally {
      setLoading(false);
    }
  }, [filePath, fetchDocument]);

  useEffect(() => {
    fetchDocumentAsync();
  }, [fetchDocumentAsync]);

  return { succeed, containerRef, error, loading, content };
};
