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

type StaffAddDoneParam = {
  is_post: boolean;
  is_exception: boolean;
  staff_name: string;
};

/**
 * スタッフ追加 完了
 * @param staffAddDoneParam
 */
const StaffSddDone = (staffAddDoneParam: StaffAddDoneParam) => {
  const router = useRouter();

  const items = [];
  items.push(
    <React.Fragment>
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 スタッフ追加 完了</title>
      </Head>
    </React.Fragment>
  );

  if (staffAddDoneParam.is_post && !staffAddDoneParam.is_exception) {
    items.push(
      <React.Fragment>
        <h2>スタッフ追加 完了</h2>
        {staffAddDoneParam.staff_name} さんを追加しました。
        <br />
      </React.Fragment>
    );
  } else {
    //#region エラーメッセージを表示
    if (!staffAddDoneParam.is_post) {
      items.push(msgElementHttpReqError);
    }
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
  let staffAddDoneParam: StaffAddDoneParam = {
    is_post: true,
    is_exception: false,
    staff_name: "string",
  };

  //#region POSTメッセージからパラメータを取得する
  if (context.req.method == "POST") {
    const body = await getRawBody(context.req);
    const body_string = body.toString();
    const body_json = formUrlDecoded(body_string);

    const name = typeof body_json.name == "undefined" ? "" : body_json.name;
    const pass = typeof body_json.pass == "undefined" ? "" : body_json.pass;

    //#region 前画面からデータを受け取る
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

    staffAddDoneParam.is_post = true;
    staffAddDoneParam.is_exception = is_exception;
    staffAddDoneParam.staff_name = staff_name;
    //console.log(staff_add_param);
  } else {
    staffAddDoneParam.is_post = false;
    staffAddDoneParam.is_exception = false;
    staffAddDoneParam.staff_name = "";
  }
  //#endregion POSTメッセージからパラメータを取得する

  return {
    props: staffAddDoneParam,
  };
};

export default StaffSddDone;
