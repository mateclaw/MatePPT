import { Spin } from 'antd';
import FileError from '../file-error';

import { useFetchDocx } from '../hooks';
import styles from './index.less';
import { useSearchParams } from 'umi';
import Mark from "mark.js";
import { useEffect } from 'react';

const Docx = ({ filePath }: { filePath: string }) => {
  const { succeed, containerRef, error, loading } = useFetchDocx(filePath);
  const [searchParams] = useSearchParams();
  const text = searchParams.get('searchText') || '';
  const searchText = decodeURIComponent(text);
  useEffect(() => {
    if (succeed && !loading) {
      const mark = new Mark(containerRef.current);

      mark.mark(searchText,{
        className:'hightlight-block'
      });

      const hightlightBlocks = document.querySelectorAll('.hightlight-block');
      if(hightlightBlocks.length){
        hightlightBlocks[0].scrollIntoView({
          behavior: 'smooth',
          // block: 'center',
          // inline: 'center'
        });
      }
      
    }

  }, [succeed, loading]);
  return (
    <>
      {loading}
      {succeed ? (
        <section className={styles.docxViewerWrapper}>
          <div id="docx" ref={containerRef} className={styles.box}>

          </div>
          {loading && <div style={{ zIndex: 100000 }} className='fixed left-0 z-50 top-0 w-full h-full bg-fill-layout flex items-center justify-center select-none' onClick={(e) => {
            e.stopPropagation()
          }}>
            <Spin  >

            </Spin>
          </div>}
        </section>
      ) : (
        <FileError>{error}</FileError>
      )}
    </>
  );
};

export default Docx;
