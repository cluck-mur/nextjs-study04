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
import withSession from "../../lib/session";
import { msgYouHaveNotLogin } from "../../lib/global_const";

type StaffAddParam = {
  login: string;
  login_staff_code: string;
  login_staff_name: string;
};

/**
 * スタッフ追加
 * @param param0
 */
const StaffAdd = (staffAddParam: StaffAddParam) => {
  const router = useRouter();

  const items = [];
  items.push(
    <React.Fragment key="success">
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 スタッフ追加</title>
      </Head>
      {
        /* ログインしていたら */
        staffAddParam.login != void 0 && (
          <React.Fragment>
            {staffAddParam.login_staff_name}さん ログイン中
            <br />
          </React.Fragment>
        )
      }
      <h2>スタッフ追加</h2>
    </React.Fragment>
  );

  if (staffAddParam.login == void 0) {
    // ログインしていなかったら
    // 未ログインメッセージを表示
    items.push(msgYouHaveNotLogin);
  } else {
    items.push(
      <React.Fragment>
        ※スタッフを新たに登録します。
        <br />
        <br />
        <form method="post" action="staff_add_check">
          <b>スタッフ名を入力してください。</b>
          <br />
          <input
            type="text"
            name="name"
            width="200px"
            maxLength={staffNameMaxLegth}
          />{" "}
          最大14文字
          <br />
          <b>パスワードを入力してください。</b>
          <br />
          <input type="password" name="pass" width="100px" />
          <br />
          <b>パスワードをもう一度入力してください。</b>
          <br />
          <input type="password" name="pass2" width="100px" />
          <br />
          <br />
          <input type="button" onClick={() => router.back()} value="戻る" />
          <input type="submit" value="OK" />
        </form>
      </React.Fragment>
    );
  }

  return <React.Fragment>{items}</React.Fragment>;
};

/**
 * SSR
 * @param context
 */
export const getServerSideProps: GetServerSideProps = withSession(
  async (context) => {
    let staffAddParam: StaffAddParam = {
      login: null,
      login_staff_code: "",
      login_staff_name: "",
    };

    const req = context.req;
    const res = context.res;

    // ログインチェック
    const login = req.session.get("login");
    if (login != void 0) {
      // ログイン済みだったら
      staffAddParam.login = login;
      staffAddParam.login_staff_code = req.session.get("staff_code");
      staffAddParam.login_staff_name = req.session.get("staff_name");
    }

    return { props: staffAddParam };
  }
);

export default StaffAdd;
