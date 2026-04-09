// import { Authorization } from '@/constants/authorization';
// // import { getAuthorization } from '@/utils/authorization-util';
// import {
//   useGetChunkHighlights,
//   useGetDocumentUrl,
// } from '@/hooks/document-hooks';
// import { Skeleton } from 'antd';
// import {
//   IHighlight, PdfHighlighter, PdfLoader,
//   AreaHighlight,
//   Highlight,
//   Popup,
// } from 'react-pdf-highlighter';
// import FileError from '../file-error';
// import { useCatchError } from '../hooks';
// import { useRef, useState } from 'react';
// type PdfLoaderProps = React.ComponentProps<typeof PdfLoader> & {
//   httpHeaders?: Record<string, string>;
// };

// const Loader = PdfLoader as React.ComponentType<PdfLoaderProps>;

// interface IProps {
//   url: string;
// }
// const HighlightPopup = ({
//   comment,
// }: {
//   comment: { text: string; emoji: string };
// }) =>
//   comment.text ? (
//     <div className="Highlight__popup">
//       {comment.emoji} {comment.text}
//     </div>
//   ) : null;
// const PdfPreviewer = ({ url }: IProps) => {
//   const { error } = useCatchError(url);
//   // const { highlights: state, setWidthAndHeight } = useGetChunkHighlights(chunk);
//   const resetHash = () => { };
//   const ref = useRef<(highlight: IHighlight) => void>(() => { });
//   const [loaded, setLoaded] = useState(false);
//   const httpHeaders = {
//     // [Authorization]: getAuthorization(),
//   };
//   return (
//     <div style={{ width: '100%', height: '100%' }}>
//       <PdfLoader
//         url={url}
//         beforeLoad={<Skeleton active />}
//         workerSrc="/js/pdfjs-dist/pdf.worker.min.js"
//         errorMessage={<FileError>{error}</FileError>}
//       >
//         {(pdfDocument) => {
//           pdfDocument.getPage(1).then((page) => {
//             const viewport = page.getViewport({ scale: 1 });
//             const width = viewport.width;
//             const height = viewport.height;
//             // setWidthAndHeight(width, height);
//           });

//           return (
//             <PdfHighlighter
//               pdfDocument={pdfDocument}
//               enableAreaSelection={(event) => event.altKey}
//               onScrollChange={resetHash}
//               scrollRef={(scrollTo) => {
//                 ref.current = scrollTo;
//                 setLoaded(true);
//               }}
//               onSelectionFinished={() => null}
//               highlightTransform={(
//                 highlight,
//                 index,
//                 setTip,
//                 hideTip,
//                 viewportToScaled,
//                 screenshot,
//                 isScrolledTo,
//               ) => {
//                 const isTextHighlight = !Boolean(
//                   highlight.content && highlight.content.image,
//                 );

//                 const component = isTextHighlight ? (
//                   <Highlight
//                     isScrolledTo={isScrolledTo}
//                     position={highlight.position}
//                     comment={highlight.comment}
//                   />
//                 ) : (
//                   <AreaHighlight
//                     isScrolledTo={isScrolledTo}
//                     highlight={highlight}
//                     onChange={() => { }}
//                   />
//                 );

//                 return (
//                   <Popup
//                     popupContent={<HighlightPopup {...highlight} />}
//                     onMouseOver={(popupContent) =>
//                       setTip(highlight, () => popupContent)
//                     }
//                     onMouseOut={hideTip}
//                     key={index}
//                   >
//                     {component}
//                   </Popup>
//                 );
//               }}
//               highlights={null}
//             />
//           );
//         }}
//       </PdfLoader>
//     </div>
//   );
// };

// export default PdfPreviewer;



import { Spin } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { FC } from 'react'
import { createPortal } from 'react-dom'
import 'react-pdf-highlighter/dist/style.css'
import { IHighlight, PdfHighlighter, PdfLoader ,} from 'react-pdf-highlighter'

import { RiCloseLine, RiZoomInLine, RiZoomOutLine } from '@remixicon/react'


import Loading from '@/components/base/loading'
import useBreakpoints, { MediaType } from '@/hooks/use-breakpoints'
import { Tooltip } from 'antd'
import { nanoid } from 'nanoid';
import { config } from '@/config';
const text = `联网平台上报传感数据或经过加工处理后的传感数据、事件告警等；智能分析边缘服务一般作 为边缘服务节点接入到物联网平台，向物联网平台上报处理加工后的事件、状态和告警等数据。 物联网平台白皮书 12`
type PdfPreviewProps = {
  url: string
  onCancel: () => void
}

const PdfPreview: FC<PdfPreviewProps> = ({
  url,
  onCancel,
}) => {
  const media = useBreakpoints()
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const isMobile = media === MediaType.mobile
  const [searchText, setSearchText] = useState(text);
  const [searchResults, setSearchResults] = useState<IHighlight[]>([]);
  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale * 1.2, 15))
    setPosition({ x: position.x - 50, y: position.y - 50 })
  }

  const zoomOut = () => {
    setScale((prevScale) => {
      const newScale = Math.max(prevScale / 1.2, 0.5)
      if (newScale === 1)
        setPosition({ x: 0, y: 0 })
      else
        setPosition({ x: position.x + 50, y: position.y + 50 })

      return newScale
    })
  }
  const findTextPositions = async (pdfDocument: any, text: string) => {
    const highlights: IHighlight[] = [];

    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
      const page = await pdfDocument.getPage(pageNumber);
      const textContent = await page.getTextContent();

      textContent.items.forEach((item: any) => {
        if (item.str.includes(text)) {
          const viewport = page.getViewport({ scale: 1 });
          const rect = {
            x1: item.transform[4],
            y1: viewport.height - item.transform[5],
            x2: item.transform[4] + item.width,
            y2: viewport.height - item.transform[5] + item.height,
            width: viewport.width,
            height: viewport.height
          };

          highlights.push({
            id: nanoid(),
            position: {
              pageNumber,
              boundingRect: rect,
              rects: [rect]
            },
            content: { text: item.str },
            comment: null
          });
        }
      });
    }

    return highlights;
  };

  const [pdfDocument1, setPdfDocument] = useState<any>(null);
  const mountedRef = useRef(true);

  // 修复1：独立处理文档加载
  useEffect(() => {
    return () => {
      mountedRef.current = false; // 组件卸载时标记
    };
  }, []);
  // 修复2：正确触发搜索逻辑
  useEffect(() => {
    if (pdfDocument1 && searchText) {
      findTextPositions(pdfDocument1, searchText).then(results => {
        if (mountedRef.current) { // 防止组件卸载后更新状态
          setSearchResults(results);
        }
      });
    }
  }, [pdfDocument1, searchText]);
  // useHotkeys('esc', onCancel)
  // useHotkeys('up', zoomIn)
  // useHotkeys('down', zoomOut)

  return createPortal(
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black/80 z-[1000] ${!isMobile && 'p-8'}`}
      onClick={e => e.stopPropagation()}
      tabIndex={-1}
    >
      <div
        className='h-[95vh] w-[100vw] max-w-full max-h-full overflow-hidden'
        style={{ transform: `scale(${scale})`, transformOrigin: 'center', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <PdfLoader
          workerSrc={config.resolvePublicAsset('js/pdf.worker.min.mjs')}
          url={url}
          
          beforeLoad={<div className='flex justify-center items-center h-64'><Loading type='app' /></div>}
        >
          {(pdfDocument) => {
            console.log(pdfDocument)
        
            return (
              <PdfHighlighter
                pdfDocument={pdfDocument}
                
                enableAreaSelection={event => event.altKey}
                scrollRef={() => { }}
                onScrollChange={() => { }}
                onSelectionFinished={() => null}

                highlightTransform={() => { return <div /> }}
                highlights={searchResults}
              />
            )
          }}
        </PdfLoader>
      </div>
      <Tooltip title={'缩小'}>
        <div className='absolute top-6 right-24 flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer'
          onClick={zoomOut}>
          <RiZoomOutLine className='w-4 h-4 text-gray-500' />
        </div>
      </Tooltip>
      <Tooltip title={'放大'}>
        <div className='absolute top-6 right-16 flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer'
          onClick={zoomIn}>
          <RiZoomInLine className='w-4 h-4 text-gray-500' />
        </div>
      </Tooltip>
      {/* <Tooltip title={'common.operation.cancel'}>
        <div
          className='absolute top-6 right-6 flex items-center justify-center w-8 h-8 bg-white/8 rounded-lg backdrop-blur-[2px] cursor-pointer'
          onClick={onCancel}>
          <RiCloseLine className='w-4 h-4 text-gray-500' />
        </div>
      </Tooltip> */}
    </div>,
    document.body,
  )
}

export default PdfPreview
