import { Link, Outlet, useLocation, history } from 'umi';
import { Button, Empty, Result } from "antd";

export default function Layout() {

  return (
    <Result
      status="403"
      title="403"
      subTitle="你没有访问该页面的权限"
      extra={<Button type="primary" onClick={() => { history.back() }}>返回</Button>}
    />
  );
}
