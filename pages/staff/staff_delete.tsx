/***************************************************
 *
 * スタッフ削除画面
 *
 ***************************************************/
import React from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import htmlspecialchars from "htmlspecialchars";
import {
  dbFilePath,
  dbFileName,
  staffNameMaxLegth,
  msgElementSystemError,
  msgElementStaffWasNotSelected,
  msgElementStaffWasNotExisted,
  msgElementStaffWasMultipleExisted,
} from "../../lib/global_const";

type StaffDeleteParam = {
  is_null_staffcode: boolean;
  is_noexist_staffcode: boolean;
  is_multipleexist_staffcode: boolean;
  is_exception: boolean;
  staff_code: number;
  staff_name: string;
};

const next_page: string = "/staff/staff_delete_done";
const previous_page: string = "/staff/staff_list";
const redirect_page: string = "/staff/staff_list";

/**
 * スタッフ修正
 * @param staffDeleteParam
 */
const StaffEdit = (staffDeleteParam: StaffDeleteParam) => {
  //#region 前画面からデータを受け取る
  const staff_name = staffDeleteParam.staff_name;
  const router = useRouter();
  //#endregion 前画面からデータを受け取る

  const items = [];
  items.push(
    <React.Fragment>
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 スタッフ削除</title>
      </Head>
      <h2>スタッフ削除</h2>
    </React.Fragment>
  );

  if (!staffDeleteParam.is_exception) {
    if (staffDeleteParam.is_null_staffcode) {
      items.push(msgElementStaffWasNotSelected);
      items.push(
        <React.Fragment>
          <br />
          <input
            type="button"
            onClick={() => router.push(redirect_page)}
            value="戻る"
          />
        </React.Fragment>
      );
    } else if (staffDeleteParam.is_noexist_staffcode) {
      items.push(msgElementStaffWasNotExisted);
      items.push(
        <React.Fragment>
          <br />
          スタッフコード: {staffDeleteParam.staff_code} 
          <br />
          <input
            type="button"
            onClick={() => router.push(redirect_page)}
            value="戻る"
          />
        </React.Fragment>
      );
    } else if (staffDeleteParam.is_multipleexist_staffcode) {
      items.push(msgElementStaffWasMultipleExisted)
      items.push(
        <React.Fragment>
          <br />
          スタッフコード: {staffDeleteParam.staff_code} 
          <br />
          <input
            type="button"
            onClick={() => router.push(redirect_page)}
            value="戻る"
          />
        </React.Fragment>
      );
    } else {
      items.push(
        <React.Fragment>
          ※スタッフを削除します。
          <br />
          <br />
          {/* スタッフコード
        <br />
        {staffDeleteParam.staff_code}
        <br /> */}
          <form method="post" action={next_page}>
            このスタッフを削除してよろしいですか？
            <br />
            <br />
            スタッフコード
            <br />
            {/* <input type="hidden" name="code" value={staffDeleteParam.staff_code} /> */}
            <input
              type="text"
              name="code"
              width="200px"
              readOnly
              style={{ background: "#dddddd" }}
              defaultValue={staffDeleteParam.staff_code}
            />
            <br />
            スタッフ名
            <br />
            <input
              type="text"
              name="name"
              width="200px"
              readOnly
              style={{ background: "#dddddd" }}
              maxLength={staffNameMaxLegth}
              defaultValue={staff_name}
              //onChange={onChangeEvent}
            />
            <br />
            <br />
            <input type="button" onClick={() => router.back()} value="戻る" />
            <input type="submit" value="OK" />
          </form>
        </React.Fragment>
      );
    }
  } else {
    //#region エラーメッセージを表示
    if (staffDeleteParam.is_exception) {
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
  /*
  const refcomp_result = CompReferer(
    context.req.headers.referer,
    context.req.headers.host,
    previous_page
  );
  */
  const refcomp_result = true;
  //#endregion refererチェック

  if (refcomp_result) {
    let staffDeleteParam: StaffDeleteParam = {
      is_null_staffcode: false,
      is_noexist_staffcode: false,
      is_multipleexist_staffcode: false,
      is_exception: false,
      staff_code: null,
      staff_name: "",
    };

    //#region POSTメッセージからパラメータを取得する
    //console.log(context.query);
    // const body = await getRawBody(context.req);
    // const body_string = body.toString();
    // const body_json = formUrlDecoded(body_string);
    //console.log(body_json)
    const staffcode: number =
      typeof context.query.staffcode == "undefined" ||
      context.query.staffcode == "null"
        ? null
        : parseInt(context.query.staffcode.toString());
    //console.log(staff_add_param);
    //#endregion POSTメッセージからパラメータを取得する

    if (staffcode != null) {
      staffDeleteParam.staff_code = staffcode;

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
          staffDeleteParam.staff_name = htmlspecialchars(staff_name);
        } else if (staff.length < 1) {
          staffDeleteParam.is_noexist_staffcode = true;
        } else {
          staffDeleteParam.is_multipleexist_staffcode = true;
        }
      } catch (e) {
        is_exception = true;
      } finally {
        staffDeleteParam.is_exception = is_exception;
      }
    } else {
      staffDeleteParam.is_null_staffcode = true;
    }
    //#endregion DBへstaffを追加
    return {
      props: staffDeleteParam,
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