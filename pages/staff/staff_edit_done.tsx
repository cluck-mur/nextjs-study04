/***************************************************
 *
 * スタッフ修正 完了 画面
 *
 ***************************************************/
import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import getRawBody from "raw-body";
import formUrlDecoded from "form-urldecoded";
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

type StaffEditDoneParam = {
  is_exception: boolean;
  staff_code: number;
  staff_name: string;
};

//const next_page: string = "/staff/staff_edit_check";
const previous_page: string = "/staff/staff_edit_check";
const redirect_page: string = "/staff/staff_list";
const return_page: string = "/staff/staff_list"

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
    </React.Fragment>
  );

  if (!staffEditDoneParam.is_exception) {
    items.push(
      <React.Fragment>
        <h2>スタッフ修正 完了</h2>
        {staffEditDoneParam.staff_name} さんを修正しました。
        <br />
        <input type="button" onClick={() => {router.push(return_page)}} value="スタッフポータルへ" />
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
};

/**
 * SSR
 * @param context
 */
export const getServerSideProps: GetServerSideProps = async (context) => {
  //#region refererチェック
  const refcomp_result = CompReferer(
    context.req.headers.referer,
    context.req.headers.host,
    previous_page
  );
  //#endregion refererチェック

  //#region POSTメッセージからパラメータを取得する
  if (context.req.method == "POST" && refcomp_result) {
    let staffEditDoneParam: StaffEditDoneParam = {
      is_exception: false,
      staff_code: null,
      staff_name: "",
    };

    const body = await getRawBody(context.req);
    const body_string = body.toString();
    const body_json = formUrlDecoded(body_string);

    const code = typeof body_json.code == "undefined" ? null : body_json.code;
    const name = typeof body_json.name == "undefined" ? "" : body_json.name;
    const pass = typeof body_json.pass == "undefined" ? "" : body_json.pass;

    //#region 前画面からデータを受け取る
    const staff_code = code;
    const staff_name = htmlspecialchars(name);
    const staff_pass = htmlspecialchars(pass);
    //#endregion 前画面からデータを受け取る

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
      const sql = `UPDATE mst_staff SET name="${staff_name}",password="${staff_pass}" WHERE code=${staff_code}`;
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
};

export default StaffEditDone;