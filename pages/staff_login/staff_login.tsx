/***************************************************
 *
 * スタッフログイン 画面
 *
 ***************************************************/
import React from "react";
import { GetStaticProps } from "next";
import Head from "next/head";

//const StaffLogin = ({}) => {
const StaffLogin = ({}) => {
  const items = [];
  items.push(
    <React.Fragment key="head">
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 スタッフログイン</title>
      </Head>
      <h2>スタッフログイン</h2>
    </React.Fragment>
  );

  items.push(
    <React.Fragment key="main">
      <form method="post" action="staff_login_check">
        <b>スタッフコード</b>
        <br />
        <input type="text" name="code" />
        <br />
        <b>パスワード</b>
        <br />
        <input type="password" name="pass" />
        <br />
        <br />
        <input type="submit" value="ログイン" />
      </form>
    </React.Fragment>
  );

  return <React.Fragment>{items}</React.Fragment>;
};

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {}
  };
};

export default StaffLogin;
