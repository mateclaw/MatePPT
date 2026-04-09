import { message, Spin } from 'antd';
import FileError from '../file-error';

import { useFetchDocx, useFetchText } from '../hooks';
import styles from './index.less';
import { Typography } from "antd";
import MateMarkdown from "@/components/base/mate-markdown";
import React, { useEffect } from 'react';
import { useSearchParams } from "umi";
import Mark from "mark.js";
const TextContent = (props) => {
  const { filePath } = props;


  const { succeed, containerRef, error, loading, content } = useFetchText(filePath);

  const [searchParams] = useSearchParams();
  const text = searchParams.get('searchText') || '';
  const searchText = decodeURIComponent(text);

  const regex = new RegExp(`(${searchText})`, 'gi');
  // const parts = content.split(regex);
  const { Title, Paragraph, Text, Link } = Typography;
  const markdownRef = React.useRef<any>(null);

  useEffect(() => {
    if (markdownRef.current) {
      // markdownRef.current.setEditorValue(content);
      const editor = markdownRef.current.getEditor();
      
      
      if (!editor) {
        // console.error("markdown editor is null")
        return;
      }


    }
  }, [content, markdownRef.current]);

  useEffect(() => {
    if (succeed && !loading) {
      const mark = new Mark(containerRef.current);

      mark.mark(searchText, {
        className: 'hightlight-block'
      });


      const hightlightBlocks = document.querySelectorAll('.hightlight-block');
      if (hightlightBlocks.length) {
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
      {succeed ? (
        <section className={styles.docxViewerWrapper}>

          <MateMarkdown
            value={content}
            isChat={true}
            isPreview={true}
            className={styles.textContainer}
            ref={markdownRef}
            searchText={searchText}
          />
          {/* <Typography >
              <Paragraph>
                {content}
              </Paragraph>
            </Typography> */}

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

export default TextContent;
