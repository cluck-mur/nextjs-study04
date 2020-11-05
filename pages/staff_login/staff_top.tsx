/***************************************************
 *
 * スタッフ管理トップ 画面
 *
 ***************************************************/
import React from "react";
import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";

const StaffTop = ({}) => {
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

  items.push(
    <React.Fragment key="main">
      <Link href="/staff/staff_list"><a>スタッフ管理</a></Link>
      <br />
      <br />
      <Link href="/product/product_list"><a>商品管理</a></Link>
    </React.Fragment>
  );

  return <React.Fragment>{items}</React.Fragment>
};

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};

export default StaffTop;
