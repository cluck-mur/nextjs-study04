/***************************************************
 *
 * スタッフ修正 完了 画面
 *
 ***************************************************/
import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import htmlspecialchars from "htmlspecialchars";
import path from "path";
import {
  msgElementHttpReqError,
  msgElementSystemError,
} from "../../lib/global_const";
import { CompReferer } from "../../lib/myUtils";
import { myParse, sanitizeFields } from "../../lib/myUtils";
import withSession from "../../lib/session";
import { msgYouHaveNotLogin } from "../../lib/global_const";
import db from "../../lib/db";
import { SQL } from "sql-template-strings";

type StaffEditDoneParam = {
  login: string;
  login_staff_code: string;
  login_staff_name: string;
  is_exception: boolean;
  staff_code: string;
  staff_name: string;
};

//const next_page: string = "/staff/staff_edit_check";
const previous_page: string = "/staff/staff_edit_check";
const redirect_page: string = "/staff/staff_list";
const return_page: string = "/staff/staff_list";

/**
 * スタッフ修正 完了
 * @param staffEditDoneParam
 */
const StaffEditDone = (staffEditDoneParam: StaffEditDoneParam) => {
  const router = useRouter();

  const items = [];
  items.push(
    <React.Fragment>
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 スタッフ修正 完了</title>
      </Head>
      {
        /* ログインしていたら */
        staffEditDoneParam.login != void 0 && (
          <React.Fragment>
            {staffEditDoneParam.login_staff_name}さん ログイン中
            <br />
          </React.Fragment>
        )
      }
      <h2>スタッフ修正 完了</h2>
    </React.Fragment>
  );

  if (staffEditDoneParam.login == void 0) {
    // ログインしていなかったら
    // 未ログインメッセージを表示
    items.push(msgYouHaveNotLogin);
  } else {
    if (!staffEditDoneParam.is_exception) {
      items.push(
        <React.Fragment>
          {staffEditDoneParam.staff_name} さんを修正しました。
          <br />
          <br />
          <input
            type="button"
            onClick={() => {
              router.push(return_page);
            }}
            value="スタッフポータルへ"
          />
        </React.Fragment>
      );
    } else {
      //#region エラーメッセージを表示
      if (staffEditDoneParam.is_exception) {
        items.push(msgElementSystemError);
      }
      //#endregion エラーメッセージを表示
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

    let staffEditDoneParam: StaffEditDoneParam = {
      login: null,
      login_staff_code: "",
      login_staff_name: "",
      is_exception: false,
      staff_code: "",
      staff_name: "",
    };

    const req = context.req;
    const res = context.res;

    //#region POSTメッセージからパラメータを取得する
    if (context.req.method == "POST" && refcomp_result) {
      // ログインチェック
      const login = req.session.get("login");
      if (login != void 0) {
        // ログイン済みだったら
        staffEditDoneParam.login = login;
        staffEditDoneParam.login_staff_code = req.session.get("staff_code");
        staffEditDoneParam.login_staff_name = req.session.get("staff_name");
      } else {
        // 未ログインだったら
        return { props: staffEditDoneParam };
      }

      const body = await myParse(req);
      //const body_json = body.json();
      const fields_json = sanitizeFields(body);

      const code =
        typeof fields_json.code == "undefined" ? "" : fields_json.code;
      const name =
        typeof fields_json.name == "undefined" ? "" : fields_json.name;
      const pass =
        typeof fields_json.pass == "undefined" ? "" : fields_json.pass;

      //#region 前画面からデータを受け取る
      const staff_code = code;
      const staff_name = name;
      const staff_pass = pass;
      //#endregion 前画面からデータを受け取る

      //#region DBへstaffを追加
      let is_exception = false;
      try {
        //#region DBアクセス
        const sql = `UPDATE mst_staff SET name="${staff_name}",password="${staff_pass}" WHERE code=${staff_code}`;
        const result = await db.query(sql);
        //#endregion DBアクセス

        if (result.error != void 0) {
          is_exception = true;
        }
      } catch (e) {
        is_exception = true;
      } finally {
        // 処理なし
      }
      //#endregion DBへstaffを追加

      staffEditDoneParam.is_exception = is_exception;
      staffEditDoneParam.staff_code = staff_code;
      staffEditDoneParam.staff_name = staff_name;
      //console.log(staff_add_param);

      return {
        props: staffEditDoneParam,
      };
    } else {
      if (context.res) {
        context.res.writeHead(303, { Location: redirect_page });
        context.res.end();
      }

      return { props: {} };
    }
    //#endregion POSTメッセージからパラメータを取得する
  }
);

export default StaffEditDone;
