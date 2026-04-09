import { Link, Outlet, useLocation, history } from 'umi';
import { Button, Empty, Result } from "antd";

export default function Layout() {

  return (
    <Result
      status="404"
      title="404"
      subTitle="你访问的页面不存在"
      extra={<Button type="primary" onClick={() => { history.back() }}>返回</Button>}
    />
  );
}
