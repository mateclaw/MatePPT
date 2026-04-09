import { Link, Outlet, useLocation,useSearchParams } from 'umi';
// import { Spin } from "antd";


export default function () {
    const [searchParams] = useSearchParams();
    console.log(searchParams)
  return (
    
    <div>
      loading
    </div>
  )
}
