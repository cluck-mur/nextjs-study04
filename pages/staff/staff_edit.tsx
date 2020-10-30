/***************************************************
 *
 * スタッフ修正画面
 *
 ***************************************************/
import { GetServerSideProps } from "next";
import Head from "next/head";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { dbFilePath, dbFileName } from "../../lib/global_const";
import getRawBody from "raw-body";
import formUrlDecoded from "form-urldecoded";
import htmlspecialchars from "htmlspecialchars";
import md5 from "md5";


type StaffEditParam = {
    exception_occured_flg: boolean;
}

const dbWorkDirectory = path.join(process.cwd(), dbFilePath);

const StaffEdit = () => {};

/**
 * SSR
 * @param context
 */
export const getServerSideProps: GetServerSideProps = async (context) => {
    let staffEditParam: StaffEditParam = {
        exception_occured_flg: false,
      };
    
    if (context.req.method == "POST") {
    //#region POSTメッセージからパラメータを取得する
    const body = await getRawBody(context.req);
    const body_string = body.toString();
    const body_json = formUrlDecoded(body_string);
    //console.log(body_json)
    const staffcode = typeof body_json.staffcode == "undefined" ? null : body_json.staffcode;
    //console.log(staff_add_param);
    //#endregion POSTメッセージからパラメータを取得する

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

    const staff = await db.all("SELECT name FROM mst_staff WHERE code=" + staffcode);
    staff.map((staff) => {
      staffListParam.staffs.push(staff);
    });
    //console.log(staffListParam);
  } catch (e) {
    exception_occured_flg = true;
  } finally {
    staffListParam.exception_occured_flg = exception_occured_flg;
  }
  //#endregion DBへstaffを追加
}

  return {
    props: staffListParam,
  };
};

export default StaffEdit;
