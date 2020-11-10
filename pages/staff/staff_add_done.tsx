/***************************************************
 *
 * スタッフ追加 完了 画面
 *
 ***************************************************/
import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import htmlspecialchars from "htmlspecialchars";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import {
  dbFilePath,
  dbFileName,
  msgElementHttpReqError,
  msgElementSystemError,
} from "../../lib/global_const";
import { CompReferer } from "../../lib/myUtils";
import { myParse, sanitizeFields } from "../../lib/myUtils";
import withSession from "../../lib/session";
import { msgYouHaveNotLogin } from "../../lib/global_const";

type StaffAddDoneParam = {
  login: string;
  login_staff_code: string;
  login_staff_name: string;
  is_exception: boolean;
  staff_name: string;
};

const previous_page: string = "/staff/staff_add_check";
const redirect_page: string = "/staff/staff_add";
const return_page: string = "/staff/staff_list";

/**
 * スタッフ追加 完了
 * @param staffAddDoneParam
 */
const StaffAddDone = (staffAddDoneParam: StaffAddDoneParam) => {
  const router = useRouter();

  const items = [];
  items.push(
    <React.Fragment key="head">
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 スタッフ追加 完了</title>
      </Head>
      {
        /* ログインしていたら */
        staffAddDoneParam.login != void 0 && (
          <React.Fragment>
            {staffAddDoneParam.login_staff_name}さん ログイン中
            <br />
          </React.Fragment>
        )
      }
      <h2>スタッフ追加 完了</h2>
    </React.Fragment>
  );

  if (staffAddDoneParam.login == void 0) {
    // ログインしていなかったら
    // 未ログインメッセージを表示
    items.push(msgYouHaveNotLogin);
  } else {
    if (!staffAddDoneParam.is_exception) {
      items.push(
        <React.Fragment key="success">
          {staffAddDoneParam.staff_name} さんを追加しました。
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
      if (staffAddDoneParam.is_exception) {
        items.push(msgElementSystemError);
      }
      //#endregion エラーメッセージを表示
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

    let staffAddDoneParam: StaffAddDoneParam = {
      login: null,
      login_staff_code: "",
      login_staff_name: "",
      is_exception: false,
      staff_name: "",
    };

    const req = context.req;
    const res = context.res;

    if (context.req.method == "POST" && refcomp_result) {
      // ログインチェック
      const login = req.session.get("login");
      if (login != void 0) {
        // ログイン済みだったら
        staffAddDoneParam.login = login;
        staffAddDoneParam.login_staff_code = req.session.get("staff_code");
        staffAddDoneParam.login_staff_name = req.session.get("staff_name");
      } else {
        // 未ログインだったら
        return { props: staffAddDoneParam };
      }

      //#region POSTメッセージからパラメータを取得する
      const body = await myParse(req);
      const body_json = body.json();
      const fields_json = sanitizeFields(body);

      staffAddDoneParam.staff_name = typeof fields_json.name == "undefined" ? "" : fields_json.name;
      const pass = typeof fields_json.pass == "undefined" ? "" : fields_json.pass;

      const staff_name = staffAddDoneParam.staff_name;
      const staff_pass = pass;
      //#endregion POSTメッセージからパラメータを取得する

      //#region DBへstaffを追加
      // DBファイルのパスを取得
      const dbWorkDirectory = path.join(process.cwd(), dbFilePath);
      const filename: string = dbFileName;
      const fullPath: string = path.join(dbWorkDirectory, filename);

      let is_exception = false;
      try {
        // DBオープン
        const db = await open({
          filename: fullPath,
          driver: sqlite3.Database,
        });
        //db.serialize();
        const sql = `INSERT INTO mst_staff(name,password,is_master) VALUES ("${staff_name}","${staff_pass}",0)`;
        let stmt = await db.prepare(sql);
        try {
          await stmt.run();
        } catch (e) {
          is_exception = true;
        } finally {
          await stmt.finalize();
        }
      } catch (e) {
        is_exception = true;
      } finally {
        // 処理なし
      }
      //#endregion DBへstaffを追加

      staffAddDoneParam.is_exception = is_exception;
      //console.log(staff_add_param);

      return {
        props: staffAddDoneParam,
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

export default StaffAddDone;
