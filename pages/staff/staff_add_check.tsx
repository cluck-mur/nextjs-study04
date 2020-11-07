/***************************************************
 *
 * スタッフ追加 入力値チェック 画面
 *
 ***************************************************/
import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import getRawBody from "raw-body";
import formUrlDecoded from "form-urldecoded";
import htmlspecialchars from "htmlspecialchars";
import md5 from "md5";
import {
  msgElementHttpReqError,
  msgElementSystemError,
} from "../../lib/global_const";
import { CompReferer } from "../../lib/myUtils";
import withSession from "../../lib/session";
import { msgYouHaveNotLogin } from "../../lib/global_const";

type StaffAddCheckParam = {
  login: string;
  login_staff_code: string;
  login_staff_name: string;
  is_exception: boolean;
  name: string | undefined;
  pass: string | undefined;
  pass2: string | undefined;
};

const next_page: string = "/staff/staff_add_done";
const previous_page: string = "/staff/staff_add";
const redirect_page: string = "/staff/staff_add";

/**
 * スタッフ追加 入力値チェック
 * @param staffAddCheckParam
 */
const StaffAddCheck = (staffAddCheckParam: StaffAddCheckParam) => {
  //#region 前画面からデータを受け取る
  const staff_name = staffAddCheckParam.name;
  let staff_pass = staffAddCheckParam.pass;
  const staff_pass2 = staffAddCheckParam.pass2;
  //#endregion 前画面からデータを受け取る

  const items = [];
  items.push(
    <React.Fragment key="head">
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 スタッフ追加チェック</title>
      </Head>
      {
        /* ログインしていたら */
        staffAddCheckParam.login != void 0 && (
          <React.Fragment>
            {staffAddCheckParam.login_staff_name}さん ログイン中
            <br />
          </React.Fragment>
        )
      }
      <h2>スタッフ追加 確認</h2>
    </React.Fragment>
  );

  if (staffAddCheckParam.login == void 0) {
    // ログインしていなかったら
    // 未ログインメッセージを表示
    items.push(msgYouHaveNotLogin);
  } else {
    if (!staffAddCheckParam.is_exception) {
      const router = useRouter();

      //#region 画面用データを設定
      let name_str: string = "";
      let pass_display_flg: boolean = false;
      let pass2_display_flg: boolean = false;

      if (staff_name == "") {
        // もしスタッフ名が入力されていなかったら "スタッフ名が入力されていません" と表示する
        name_str = "スタッフ名が入力されていません";
      } else {
        // もしスタッフ名が入力されていたらスタッフ名を表示する
        name_str = `スタッフ名：${staff_name}`;
      }

      if (staff_pass == "") {
        // もしパスワードが入力されていなかったら "パスワードが入力されていません" と表示する
        pass_display_flg = true;
      }

      if (staff_pass != staff_pass2) {
        // もし１回目のパスワードと2回目のパスワードが一致しなかったら "パスワードが一致しません" と表示する
        pass2_display_flg = true;
      }
      //#endregion 画面用データを設定

      //#region 次画面へ移行できるか判断する
      let can_move_next_page = true;
      if (staff_name == "" || staff_pass == "" || staff_pass != staff_pass2) {
        can_move_next_page = false;
      } else {
        // パスワードをハッシュ化する
        staff_pass = md5(staff_pass);
      }
      //#endregion 次画面へ移行できるか判断する

      //#region JSX
      items.push(
        <React.Fragment key="main">
          {/* もし入力に問題があったら "戻る"ボタンだけを表示する */}
          {can_move_next_page ? (
            <React.Fragment key="success">
              以下のスタッフを追加します。
              <br />
              よろしいですか？
              <br />
              <br />
            </React.Fragment>
          ) : (
            <React.Fragment key="success"></React.Fragment>
          )}
          {/* スタッフ名表示 */}
          <div>{name_str}</div>
          {/* パスワード未入力警告文表示 */}
          {pass_display_flg && (
            <div>
              パスワードが入力されていません
              <br />
            </div>
          )}
          {/* パスワード不一致警告文表示 */}
          {pass2_display_flg && (
            <div>
              パスワードが一致しません
              <br />
            </div>
          )}
          {can_move_next_page ? (
            <form method="post" action={next_page}>
              <input type="hidden" name="name" value={staff_name} />
              <input type="hidden" name="pass" value={staff_pass} />
              <br />
              <input type="button" onClick={() => router.back()} value="戻る" />
              <input type="submit" value="OK" />
            </form>
          ) : (
            <form>
              <input type="button" onClick={() => router.back()} value="戻る" />
            </form>
          )}
        </React.Fragment>
      );
      //#endregion JSX
    } else {
      if (staffAddCheckParam.is_exception) {
        items.push(msgElementSystemError);
      }
    }
  }

  return <React.Fragment>{items}</React.Fragment>;
};

/**
 * SSR
 * @param context
 */
export const getServerSideProps: GetServerSideProps = withSession(
  async (context) => {
    //#region refererチェック
    const refcomp_result = CompReferer(
      context.req.headers.referer,
      context.req.headers.host,
      previous_page
    );
    //#endregion refererチェック

    let staffAddCheckParam: StaffAddCheckParam = {
      login: null,
      login_staff_code: "",
      login_staff_name: "",
      is_exception: false,
      name: "",
      pass: "",
      pass2: "",
    };

    const req = context.req;
    const res = context.res;

    if (context.req.method == "POST" && refcomp_result) {
      // ログインチェック
      const login = req.session.get("login");
      if (login != void 0) {
        // ログイン済みだったら
        staffAddCheckParam.login = login;
        staffAddCheckParam.login_staff_code = req.session.get("staff_code");
        staffAddCheckParam.login_staff_name = req.session.get("staff_name");
      } else {
        // 未ログインだったら
        return { props: staffAddCheckParam };
      }

      //#region POSTメッセージからパラメータを取得する
      const body = await getRawBody(context.req);
      const body_string = body.toString();
      const body_json = formUrlDecoded(body_string);
      //console.log(body_json)

      const name = typeof body_json.name == "undefined" ? "" : body_json.name;
      const pass = typeof body_json.pass == "undefined" ? "" : body_json.pass;
      const pass2 =
        typeof body_json.pass2 == "undefined" ? "" : body_json.pass2;
      //console.log(staff_add_param);

      staffAddCheckParam.name = htmlspecialchars(name);
      staffAddCheckParam.pass = htmlspecialchars(pass);
      staffAddCheckParam.pass2 = htmlspecialchars(pass2);
      //#endregion POSTメッセージからパラメータを取得する
    } else {
      if (context.res) {
        context.res.writeHead(303, { Location: redirect_page });
        context.res.end();
      }
    }
    
    return {
      props: staffAddCheckParam,
    };
  }
);

export default StaffAddCheck;
