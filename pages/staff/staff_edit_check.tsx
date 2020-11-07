/***************************************************
 *
 * スタッフ修正 入力値チェック 画面
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

type StaffEditCheckParam = {
  login: string;
  login_staff_code: string;
  login_staff_name: string;
  is_exception: boolean;
  code: string | undefined;
  name: string | undefined;
  pass: string | undefined;
  pass2: string | undefined;
};

const next_page: string = "/staff/staff_edit_done";
const previous_page: string = "/staff/staff_edit";
const redirect_page: string = "/staff/staff_list";

/**
 * スタッフ修正 入力値チェック
 * @param staffEditCheckParam
 */
const StaffEditCheck = (staffEditCheckParam: StaffEditCheckParam) => {
  //#region 前画面からデータを受け取る
  const staff_code = staffEditCheckParam.code;
  const staff_name = staffEditCheckParam.name;
  let staff_pass = staffEditCheckParam.pass;
  const staff_pass2 = staffEditCheckParam.pass2;
  //#endregion 前画面からデータを受け取る

  const items = [];
  items.push(
    <React.Fragment>
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 スタッフ修正チェック</title>
      </Head>
      {
        /* ログインしていたら */
        staffEditCheckParam.login != void 0 && (
          <React.Fragment>
            {staffEditCheckParam.login_staff_name}さん ログイン中
            <br />
          </React.Fragment>
        )
      }
      <h2>スタッフ修正 確認</h2>
    </React.Fragment>
  );

  if (staffEditCheckParam.login == void 0) {
    // ログインしていなかったら
    // 未ログインメッセージを表示
    items.push(msgYouHaveNotLogin);
  } else {
    if (!staffEditCheckParam.is_exception) {
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
        <React.Fragment>
          {/* もし入力に問題があったら "戻る"ボタンだけを表示する */}
          {can_move_next_page ? (
            <React.Fragment>
              {/* <Head>
              <meta charSet="UTF-8" />
              <title>ろくまる農園 スタッフ修正 確認</title>
            </Head> */}
              以下のスタッフを修正します。
              <br />
              よろしいですか？
              <br />
              <br />
            </React.Fragment>
          ) : (
            <React.Fragment></React.Fragment>
          )}
          {/* スタッフコード表示 */}
          <div>コード : {staff_code}</div>
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
              <input type="hidden" name="code" value={staff_code} />
              <input type="hidden" name="name" value={staff_name} />
              <input type="hidden" name="pass" value={staff_pass} />
              <br />
              <input
                type="button"
                onClick={() => router.push("staff_list")}
                value="戻る"
              />
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
      if (staffEditCheckParam.is_exception) {
        items.push(msgElementSystemError);
      }
    }

    return <React.Fragment>{items}</React.Fragment>;
  }
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

    if (context.req.method == "POST" && refcomp_result) {
      let staffEditCheckParam: StaffEditCheckParam = {
        login: null,
        login_staff_code: "",
        login_staff_name: "",
        is_exception: false,
        code: "",
        name: "",
        pass: "",
        pass2: "",
      };

      const req = context.req;
      const res = context.res;

      // ログインチェック
      const login = req.session.get("login");
      if (login != void 0) {
        // ログイン済みだったら
        staffEditCheckParam.login = login;
        staffEditCheckParam.login_staff_code = req.session.get("staff_code");
        staffEditCheckParam.login_staff_name = req.session.get("staff_name");
      } else {
        // 未ログインだったら
        return { props: staffEditCheckParam };
      }

      //#region POSTメッセージからパラメータを取得する
      const body = await getRawBody(context.req);
      const body_string = body.toString();
      const body_json = formUrlDecoded(body_string);
      //console.log(body_json)
      const code = typeof body_json.code == "undefined" ? "" : body_json.code;
      const name = typeof body_json.name == "undefined" ? "" : body_json.name;
      const pass = typeof body_json.pass == "undefined" ? "" : body_json.pass;
      const pass2 =
        typeof body_json.pass2 == "undefined" ? "" : body_json.pass2;
      //console.log(staff_add_param);
      staffEditCheckParam.code = htmlspecialchars(code);
      staffEditCheckParam.name = htmlspecialchars(name);
      staffEditCheckParam.pass = htmlspecialchars(pass);
      staffEditCheckParam.pass2 = htmlspecialchars(pass2);
      //#endregion POSTメッセージからパラメータを取得する

      return {
        props: staffEditCheckParam,
      };
    } else {
      if (context.res) {
        context.res.writeHead(303, { Location: redirect_page });
        context.res.end();
      }

      return { props: {} };
    }
  }
);

export default StaffEditCheck;
