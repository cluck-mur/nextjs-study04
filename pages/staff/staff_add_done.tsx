/***************************************************
 *
 * スタッフ追加 完了 画面
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

type StaffAddDoneParam = {
  is_exception: boolean;
  staff_name: string;
};

const previous_page: string = "/staff/staff_add_check";
const redirect_page: string = "/staff/staff_add";

/**
 * スタッフ追加 完了
 * @param staffAddDoneParam
 */
const StaffSddDone = (staffAddDoneParam: StaffAddDoneParam) => {
  const router = useRouter();

  const items = [];
  items.push(
    <React.Fragment key="head">
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 スタッフ追加 完了</title>
      </Head>
    </React.Fragment>
  );

  if (!staffAddDoneParam.is_exception) {
    items.push(
      <React.Fragment key="success">
        <h2>スタッフ追加 完了</h2>
        {staffAddDoneParam.staff_name} さんを追加しました。
        <br />
      </React.Fragment>
    );
  } else {
    //#region エラーメッセージを表示
    if (staffAddDoneParam.is_exception) {
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

  if (context.req.method == "POST" && refcomp_result) {
    let staffAddDoneParam: StaffAddDoneParam = {
      is_exception: false,
      staff_name: "",
    };

    //#region POSTメッセージからパラメータを取得する
    const body = await getRawBody(context.req);
    const body_string = body.toString();
    const body_json = formUrlDecoded(body_string);

    const name = typeof body_json.name == "undefined" ? "" : body_json.name;
    const pass = typeof body_json.pass == "undefined" ? "" : body_json.pass;

    const staff_name = htmlspecialchars(name);
    const staff_pass = htmlspecialchars(pass);
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
      const sql = `INSERT INTO mst_staff(name,password) VALUES ("${staff_name}","${staff_pass}")`;
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
    staffAddDoneParam.staff_name = staff_name;
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
};

export default StaffSddDone;
