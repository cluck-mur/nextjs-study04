/***************************************************
 *
 * スタッフ追加 完了 画面
 *
 ***************************************************/
import Head from "next/head";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import getRawBody from "raw-body";
import formUrlDecoded from "form-urldecoded";
import htmlspecialchars from "htmlspecialchars";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { dbFilePath, dbFileName } from "../../lib/global_const";

type StaffAddDoneParam = {
  is_post: boolean;
  exception_occured_flg: boolean;
  staff_name: string;
};

const dbWorkDirectory = path.join(process.cwd(), dbFilePath);

/**
 * スタッフ追加 完了
 * @param staffAddDoneParam
 */
const StaffSddDone = (staffAddDoneParam: StaffAddDoneParam) => {
  const router = useRouter();

  if (staffAddDoneParam.is_post) {
    if (!staffAddDoneParam.exception_occured_flg) {
      return (
        <div>
          {staffAddDoneParam.staff_name} さんを追加しました。
          <br />
        </div>
      );
    } else {
      return (
        <div>
          ただいま障害により大変ご迷惑をお掛けしております。
          <br />
        </div>
      );
    }
  } else {
    return (
      <div>
        原因不明のエラーが発生しました。
        <br />
        申し訳ありませんがもう一度最初からやり直してください。
        <br />
      </div>
    );
  }
};

/**
 * SSR
 * @param context
 */
export const getServerSideProps: GetServerSideProps = async (context) => {
  let staffAddDoneParam: StaffAddDoneParam;

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
    const filename: string = dbFileName;
    const fullPath: string = path.join(dbWorkDirectory, filename);

    let exception_occured_flg = false;
    try {
      // DBオープン
      const db = await open({
        filename: fullPath,
        driver: sqlite3.Database,
      });
      //db.serialize();
      let stmt = await db.prepare(
        `INSERT INTO mst_staff(name,password) VALUES ("${staff_name}","${staff_pass}")`
      );
      try {
        // await stmt.run("InsertStaff");
        await stmt.run();
      } catch (e) {
        exception_occured_flg = true;
      } finally {
        await stmt.finalize();
      }
    } catch (e) {
      exception_occured_flg = true;
    } finally {
      // 処理なし
    }
    //#endregion DBへstaffを追加

    staffAddDoneParam = {
      is_post: true,
      exception_occured_flg: exception_occured_flg,
      staff_name: staff_name,
    };
    //console.log(staff_add_param);
  } else {
    staffAddDoneParam = {
      is_post: false,
      exception_occured_flg: false,
      staff_name: "",
    };
  }
  //#endregion POSTメッセージからパラメータを取得する

  return {
    props: staffAddDoneParam,
  };
};

export default StaffSddDone;
