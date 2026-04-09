import '@js-preview/excel/lib/index.css';
import FileError from '../file-error';
import { useFetchExcel } from '../hooks';
import { Spin } from "antd";

const Excel = ({ filePath }: { filePath: string }) => {
  const { status, containerRef, error, loading } = useFetchExcel(filePath);

  return (

    <div
      id="excel"
      ref={containerRef}
      style={{ height: '100%', width: '100%' }}
    >
      {status || <FileError>{error}</FileError>}


      {loading && <div style={{ zIndex: 100000 }} className='fixed left-0 z-50 top-0 w-full h-full bg-fill-layout flex items-center justify-center select-none' onClick={(e) => {
        e.stopPropagation()
      }}>
        <Spin  >

        </Spin>
      </div>}
    </div>
  );
};

export default Excel;
