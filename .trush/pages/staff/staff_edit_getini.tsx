/***************************************************
 *
 * スタッフ情報修正画面 NOT-SSR版
 *
 ***************************************************/
import React from "react";
//import { useState } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { dbFilePath, dbFileName } from "../../../lib/global_const";
import getRawBody from "raw-body";
import formUrlDecoded from "form-urldecoded";
import htmlspecialchars from "htmlspecialchars";
import md5 from "md5";
import { GenJsxMessage } from "../../../lib/myUtils";

type StaffEditParam = {
  is_post: boolean;
  is_exception: boolean;
  display_message: string[];
  staff_code: number;
  staff_name: string;
};

/**
 * スタッフ情報修正
 * @param staffEditParam
 */
function StaffEdit(staffEditParam: StaffEditParam) {
  //const [value, setValue] = useState("");

  //#region 前画面からデータを受け取る
  //const staff_name = htmlspecialchars(staffEditParam.staff_name);
  const staff_name = staffEditParam.staff_name;
  const router = useRouter();
  //#endregion 前画面からデータを受け取る

  if (staffEditParam.is_post && !staffEditParam.is_exception) {
    // const onChangeEvent = (event) => {
    //   setValue(event.target.value);
    // };

    return (
      <React.Fragment>
        <Head>
          <meta charSet="UTF-8" />
          <title>ろくまる農園 スタッフ情報修正</title>
        </Head>
        スタッフ情報修正
        <br />
        <br />
        スタッフコード
        <br />
        {staffEditParam.staff_code}
        <br />
        <form method="post" action="staff_edit_check">
          <input type="hidden" name="code" value={staffEditParam.staff_code} />
          スタッフ名
          <br />
          <input key="staff_name"
            type="text"
            name="name"
            width="200px"
            defaultValue={staff_name}
            //onChange={onChangeEvent}
          />
          <br />
          パスワードを入力してください。
          <br />
          <input key="pass" type="password" name="pass" width="100px" />
          <br />
          パスワードをもう一度入力してください。
          <br />
          <input key="pass2" type="password" name="pass2" width="100px" />
          <br />
          <br />
          <input type="button" onClick={() => router.back()} value="戻る" />
          <input type="submit" value="OK" />
        </form>
      </React.Fragment>
    );
  } else {
    return GenJsxMessage(staffEditParam.display_message);
  }
};

/**
 * getInitialProps
 * @param context
 */
StaffEdit.getInitialProps = async (context) => {
  let staffEditParam: StaffEditParam = {
    is_post: true,
    is_exception: false,
    display_message: [],
    staff_code: null,
    staff_name: "",
  };

  const dbWorkDirectory = path.join(process.cwd(), dbFilePath);

  if (context.req.method == "POST") {
    //#region POSTメッセージからパラメータを取得する
    const body = await getRawBody(context.req);
    const body_string = body.toString();
    const body_json = formUrlDecoded(body_string);
    //console.log(body_json)
    const staffcode =
      typeof body_json.staffcode == "undefined" ? null : body_json.staffcode;
    //console.log(staff_add_param);
    //#endregion POSTメッセージからパラメータを取得する

    //#region DBへstaffを追加
    // DBファイルのパスを取得
    const filename: string = dbFileName;
    const fullPath: string = path.join(dbWorkDirectory, filename);
    let is_exception: boolean = false;
    let display_message: string[] = [];
    try {
      // DBオープン
      const db = await open({
        filename: fullPath,
        driver: sqlite3.Database,
      });
      //db.serialize();

      const staff: { name: string }[] = await db.all(
        `SELECT name FROM mst_staff WHERE code=${staffcode}`
      );
      console.log(staff);
      if (staff.length == 1) {
        const staff_name = staff[0].name;

        staffEditParam.staff_code = staffcode;
        staffEditParam.staff_name = htmlspecialchars(staff_name);
      } else if (staff.length < 1) {
        is_exception = true;
        display_message.push("指定されたスタッフは見つかりませんでした。");
        display_message.push("申し訳ありませんがもう一度やり直してください。");
      } else {
        is_exception = true;
        display_message.push("指定されたスタッフは重複して登録されています。");
        display_message.push("申し訳ありませんがもう一度やり直してください。");
      }
    } catch (e) {
      is_exception = true;
      display_message.push(
        "ただいま障害により大変ご迷惑をお掛けしております。"
      );
    } finally {
      staffEditParam.is_exception = is_exception;
      staffEditParam.display_message = display_message;
    }
    //#endregion DBへstaffを追加
  } else {
    staffEditParam.is_post = false;
    staffEditParam.display_message.push("原因不明のエラーが発生しました。");
    staffEditParam.display_message.push(
      "申し訳ありませんがもう一度やり直してください。"
    );
  }

  return staffEditParam;
};

export default StaffEdit;
