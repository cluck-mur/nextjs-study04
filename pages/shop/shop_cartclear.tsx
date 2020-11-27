/***************************************************
 *
 * ショップ カートクリア 画面
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
 * カートクリア
 */
const StaffLogout = ({}) => {
  const items = [];
  items.push(
    <React.Fragment key="head">
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 カートクリア</title>
      </Head>
      <h2>カートクリア</h2>
    </React.Fragment>
  );

  items.push(
    <React.Fragment>
      カートを空にしました。
      {/* <br />
      <br />
      <Link href="/staff_login/staff_login">ログイン画面へ</Link> */}
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

    //#region カートクリア処理
    req.session.unset("cart");
    await req.session.save();
    // await req.session.destroy();
    //#endregion カートクリア処理

    return { props: {} };
  }
);

export default StaffLogout;
