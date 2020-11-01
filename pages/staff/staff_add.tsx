/***************************************************
 *
 * スタッフ追加画面
 *
 ***************************************************/
import React from "react";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { staffNameMaxLegth } from "../../lib/global_const";

/**
 * スタッフ追加
 * @param param0
 */
const StaffAdd = ({}) => {
  const router = useRouter();

  const items = [];
  items.push(
    <React.Fragment key="success">
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 スタッフ追加</title>
      </Head>
      <h2>スタッフ追加</h2>
      ※スタッフを新たに登録します。
      <br />
      <br />
      <form method="post" action="staff_add_check">
        スタッフ名を入力してください。
        <br />
        <input
          type="text"
          name="name"
          width="200px"
          maxLength={staffNameMaxLegth}
        />{" "}
        最大14文字
        <br />
        パスワードを入力してください。
        <br />
        <input type="password" name="pass" width="100px" />
        <br />
        パスワードをもう一度入力してください。
        <br />
        <input type="password" name="pass2" width="100px" />
        <br />
        <br />
        <input type="button" onClick={() => router.back()} value="戻る" />
        <input type="submit" value="OK" />
      </form>
    </React.Fragment>
  );

  return <React.Fragment>{items}</React.Fragment>;
};

/**
 * SSR
 * @param context
 */
export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {},
  };
};

export default StaffAdd;
