/***************************************************
 *
 * スタッフログアウト 画面
 *
 ***************************************************/
import React from "react";
import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
// import { applySession } from "next-iron-session";
import withSession from "../../lib/session";
import { GetServerSideProps } from "next";

/**
 * スタッフログアウト
 * @param staffLoginCheckParam
 */
const StaffLogout = ({}) => {
  const items = [];
  items.push(
    <React.Fragment key="head">
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 スタッフログアウト</title>
      </Head>
      <h2>スタッフログアウト</h2>
    </React.Fragment>
  );

  items.push(
    <React.Fragment>
      ログアウトしました。
      <br />
      <br />
      <Link href="/staff_login/staff_login">ログイン画面へ</Link>
    </React.Fragment>
  );

  return <React.Fragment>{items}</React.Fragment>;
};

/**
 * SSR
 */
export const getServerSideProps: GetServerSideProps = withSession(
  async (context) => {
    const req = context.req;
    const res = context.res;

    //#region ログアウト処理
    // req.session.unset("login");
    // req.session.unset("staff_code");
    // req.session.unset("staff_name");
    // await req.session.save();
    await req.session.destroy();
    //#endregion ログアウト処理

    return { props: {} };
  }
);

export default StaffLogout;
