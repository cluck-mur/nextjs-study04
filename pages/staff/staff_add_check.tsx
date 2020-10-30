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

type StaffAddCheckParam = {
  name: string | undefined;
  pass: string | undefined;
  pass2: string | undefined;
};

/**
 * スタッフ追加 入力値チェック
 * @param param0
 */
const StaffAddCheck = (staffAddCheckParam: StaffAddCheckParam) => {
  //#region 前画面からデータを受け取る
  const staff_name = htmlspecialchars(staffAddCheckParam.name);
  let staff_pass = htmlspecialchars(staffAddCheckParam.pass);
  const staff_pass2 = htmlspecialchars(staffAddCheckParam.pass2);
  const router = useRouter();
  //#endregion 前画面からデータを受け取る

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
  return (
    <React.Fragment>
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 スタッフ追加チェック</title>
      </Head>
      {/* もし入力に問題があったら "戻る"ボタンだけを表示する */}
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
        <form method="post" action="staff_add_done">
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
};

/**
 * SSR
 * @param context
 */
export const getServerSideProps: GetServerSideProps = async (context) => {
  let staffAddCheckParam: StaffAddCheckParam;

  if (context.req.method == "POST") {
    //#region POSTメッセージからパラメータを取得する
    const body = await getRawBody(context.req);
    const body_string = body.toString();
    const body_json = formUrlDecoded(body_string);
    //console.log(body_json)
    const name = typeof body_json.name == "undefined" ? "" : body_json.name;
    const pass = typeof body_json.pass == "undefined" ? "" : body_json.pass;
    const pass2 = typeof body_json.pass2 == "undefined" ? "" : body_json.pass2;
    staffAddCheckParam = {
      name: name,
      pass: pass,
      pass2: pass2,
    };
    //console.log(staff_add_param);
    //#endregion POSTメッセージからパラメータを取得する
  } else {
    staffAddCheckParam = {
      name: "",
      pass: "",
      pass2: "",
    };
  }

  return {
    props: staffAddCheckParam,
  };
};

export default StaffAddCheck;
