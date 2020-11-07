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
import { msgYouHaveNotLogin } from "../../lib/global_const";

type StaffTopParam = {
  login: string;
  login_staff_code: string;
  login_staff_name: string;
};

const StaffTop = (staffTopParam: StaffTopParam) => {
  const items = [];
  items.push(
    <React.Fragment key="head">
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 ショップ管理トップ</title>
      </Head>
      {
        /* ログインしていたら */
        staffTopParam.login != void 0 && (
          <React.Fragment>
            {staffTopParam.login_staff_name}さん ログイン中
            <br />
          </React.Fragment>
        )
      }
      <h2>ショップ管理 トップメニュー</h2>
    </React.Fragment>
  );

  if (staffTopParam.login == void 0) {
    // ログインしていなかったら
    // 未ログインメッセージを表示
    items.push(msgYouHaveNotLogin);
  } else {
    // ログインしていたら
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
        <br />
        <br />
        <Link href="/staff_login/staff_logout">
          <a>ログアウト</a>
        </Link>
      </React.Fragment>
    );
  }

  return <React.Fragment>{items}</React.Fragment>;
};

export const getServerSideProps: GetServerSideProps = withSession(
  async (context) => {
    const req = context.req;
    const res = context.res;

    const staffTopParam: StaffTopParam = {
      login: null,
      login_staff_code: "",
      login_staff_name: "",
    };

    // ログインチェック
    const login = req.session.get("login");
    if (login != void 0) {
      staffTopParam.login = login;
      staffTopParam.login_staff_code = req.session.get("staff_code");
      staffTopParam.login_staff_name = req.session.get("staff_name");
    }

    return {
      props: staffTopParam,
    };
  }
);

export default StaffTop;
