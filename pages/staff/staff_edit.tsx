/***************************************************
 *
 * スタッフ修正画面
 *
 ***************************************************/
import React from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import getRawBody from "raw-body";
import formUrlDecoded from "form-urldecoded";
import htmlspecialchars from "htmlspecialchars";
import {
  dbFilePath,
  dbFileName,
  msgElementHttpReqError,
  msgElementSystemError,
  staffNameMaxLegth,
} from "../../lib/global_const";
import { CompReferer } from "../../lib/myUtils";

type StaffEditParam = {
  is_exception: boolean;
  staff_code: number;
  staff_name: string;
};

const next_page: string = "/staff/staff_edit_check";
const previous_page: string = "/staff/staff_list";
const redirect_page: string = "/staff/staff_list";

/**
 * スタッフ修正
 * @param staffEditParam
 */
const StaffEdit = (staffEditParam: StaffEditParam) => {
  //#region 前画面からデータを受け取る
  const staff_name = staffEditParam.staff_name;
  const router = useRouter();
  //#endregion 前画面からデータを受け取る

  const items = [];
  items.push(
    <React.Fragment>
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 スタッフ修正</title>
      </Head>
    </React.Fragment>
  );

  if (!staffEditParam.is_exception) {
    items.push(
      <React.Fragment>
        <h2>スタッフ修正</h2>
        ※スタッフの名前とパスワードを変更します。
        <br />
        <br />
        {/* スタッフコード
        <br />
        {staffEditParam.staff_code}
        <br /> */}
        <form method="post" action={next_page}>
          スタッフコード
          <br />
          {/* <input type="hidden" name="code" value={staffEditParam.staff_code} /> */}
          <input
            type="text"
            name="code"
            width="200px"
            readOnly
            style={{ background: "#dddddd" }}
            defaultValue={staffEditParam.staff_code}
          />
          <br />
          スタッフ名
          <br />
          <input
            type="text"
            name="name"
            width="200px"
            maxLength={staffNameMaxLegth}
            defaultValue={staff_name}
            //onChange={onChangeEvent}
          />{" "}
          最大14文字
          <br />
          パスワードを入力してください。
          <br />
          <input type="password" name="pass" width="100px" />
          <br />
          パスワードをもう一度入力してください。
          <br />
          <input type="password" name="pass2" width="100px" />
          <br />
          <br />
          <input type="button" onClick={() => router.back()} value="戻る" />
          <input type="submit" value="OK" />
        </form>
      </React.Fragment>
    );
  } else {
    //#region エラーメッセージを表示
    if (staffEditParam.is_exception) {
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
    let staffEditParam: StaffEditParam = {
      is_exception: false,
      staff_code: null,
      staff_name: "",
    };

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
    const dbWorkDirectory = path.join(process.cwd(), dbFilePath);
    const filename: string = dbFileName;
    const fullPath: string = path.join(dbWorkDirectory, filename);
    let is_exception: boolean = false;
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
      // console.log(staff);
      if (staff.length == 1) {
        const staff_name = staff[0].name;

        staffEditParam.staff_code = staffcode;
        staffEditParam.staff_name = htmlspecialchars(staff_name);
      } else if (staff.length < 1) {
        is_exception = true;
      } else {
        is_exception = true;
      }
    } catch (e) {
      is_exception = true;
    } finally {
      staffEditParam.is_exception = is_exception;
    }
    //#endregion DBへstaffを追加
    return {
      props: staffEditParam,
    };
  } else {
    if (context.res) {
      context.res.writeHead(303, { Location: redirect_page });
      context.res.end();
    }

    return { props: {} };
  }
};

export default StaffEdit;
