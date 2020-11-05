/***************************************************
 *
 * スタッフ管理トップ 画面
 *
 ***************************************************/
import React from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import withSession from "../../lib/session";

type StaffTopParam = {
  login: string;
  staff_code: string;
  staff_name: string;
};

const StaffTop = (staffTopParam: StaffTopParam) => {
  const items = [];
  items.push(
    <React.Fragment key="head">
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 ショップ管理トップ</title>
      </Head>
      <h2>ショップ管理 トップメニュー</h2>
    </React.Fragment>
  );

  if (staffTopParam.login == null) {
    items.push(
      <React.Fragment key="main">
        ログインされていません。
        <br />
        <Link href="/staff_login/staff_login">
          <a>ログイン画面へ</a>
        </Link>
      </React.Fragment>
    );
  } else {

    items.push(
      <React.Fragment key="main">
        <Link href="/staff/staff_list">
          <a>スタッフ管理</a>
        </Link>
        <br />
        <br />
        <Link href="/product/product_list">
          <a>商品管理</a>
        </Link>
      </React.Fragment>
    );
  }

  return <React.Fragment>{items}</React.Fragment>;
};

export const getServerSideProps: GetServerSideProps = withSession(async ({req, res}) => {
  const staffTopParam: StaffTopParam = {
    login: null,
    staff_code: "",
    staff_name: "",
  };

  const login = req.session.get("login");
  if (login != void 0) {
    staffTopParam.login = login;
    staffTopParam.staff_code = req.session.get("staff_code");
    staffTopParam.staff_name = req.session.get("staff_name");
  }

  return {
    props: staffTopParam,
  };
});

export default StaffTop;
