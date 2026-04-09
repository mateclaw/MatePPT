import { Images } from '@/constants/common';
// import { api_host } from '@/utils/api';
import { Flex, Image, Empty } from 'antd';
import { useParams, useSearchParams } from 'umi';
import Docx from './docx';
import Excel from './excel';
import Pdf from './pdf';
import TextContent from "./text";

import styles from './index.less';

// TODO: The interface returns an incorrect content-type for the SVG.

const DocumentViewer = () => {
  const { id: documentId } = useParams();
  const [currentQueryParameters] = useSearchParams();

  const prefix = currentQueryParameters.get('prefix');
  // const api = `${api_host}/${prefix || 'file'}/get/${documentId}`;
  const api = currentQueryParameters.get('fileUrl');
  const textAccepts = [
    'txt',
    'json',
    'js',
    'css',
    'java',
    'py',
    'html',
    'jsx',
    'ts',
    'tsx',
    'xml',
    'md',
    'log'
  ]

  if (!api) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="文件不存在" ></Empty>
  }

  const ext = api?.split('.').pop().toLocaleLowerCase();
  

  return (
    <section className={styles.viewerWrapper}>
      {Images.includes(ext!) && (
        <Flex className={styles.image} align="center" justify="center">
          <Image src={api} preview={false}></Image>
        </Flex>
      )}
      {ext === 'pdf' && <Pdf url={api}></Pdf>}
      {(ext === 'xlsx' || ext === 'xls') && <Excel filePath={api}></Excel>}

      {ext === 'docx' && <Docx filePath={api}></Docx>}
      {textAccepts.includes(ext!) && (
        <TextContent filePath={api}/>
      )}
    </section>
  );
};

export default DocumentViewer;
