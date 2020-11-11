/***************************************************
 *
 * スタッフ削除画面
 *
 ***************************************************/
import React from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import path from "path";
import htmlspecialchars from "htmlspecialchars";
import {
  staffNameMaxLegth,
  msgElementSystemError,
  msgElementStaffWasNotSelected,
  msgElementStaffWasNotExisted,
  msgElementStaffWasMultipleExisted,
} from "../../lib/global_const";
import withSession from "../../lib/session";
import { msgYouHaveNotLogin } from "../../lib/global_const";
import db from "../../lib/db";
import { SQL } from "sql-template-strings";

type StaffDeleteParam = {
  login: string;
  login_staff_code: string;
  login_staff_name: string;
  is_null_staffcode: boolean;
  is_noexist_staffcode: boolean;
  is_multipleexist_staffcode: boolean;
  is_exception: boolean;
  staff_code: string;
  staff_name: string;
  is_master: boolean;
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
      {
        /* ログインしていたら */
        staffDeleteParam.login != void 0 && (
          <React.Fragment>
            {staffDeleteParam.login_staff_name}さん ログイン中
            <br />
          </React.Fragment>
        )
      }
      <h2>スタッフ削除</h2>
    </React.Fragment>
  );

  if (staffDeleteParam.login == void 0) {
    // ログインしていなかったら
    // 未ログインメッセージを表示
    items.push(msgYouHaveNotLogin);
  } else {
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
            <b>スタッフコード</b>
            <br />
            {staffDeleteParam.staff_code}
            <br />
            <br />
            <input
              type="button"
              onClick={() => router.push(redirect_page)}
              value="戻る"
            />
          </React.Fragment>
        );
      } else if (staffDeleteParam.is_multipleexist_staffcode) {
        items.push(msgElementStaffWasMultipleExisted);
        items.push(
          <React.Fragment>
            <br />
            <b>スタッフコード</b>
            <br />
            {staffDeleteParam.staff_code}
            <br />
            <br />
            <input
              type="button"
              onClick={() => router.push(redirect_page)}
              value="戻る"
            />
          </React.Fragment>
        );
      } else if (staffDeleteParam.is_master) {
        // マスター管理者だったら
        items.push(
          <React.Fragment>
            <div style={{ color: "red" }}>
              マスター管理者を削除することはできません。
            </div>
            <br />
            <b>スタッフコード</b>
            <br />
            {staffDeleteParam.staff_code}
            <br />
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
              <b>スタッフコード</b>
              <br />
              {/* <input type="hidden" name="code" value={staffDeleteParam.staff_code} /> */}
              <input
                type="hidden"
                name="code"
                width="200px"
                readOnly
                style={{ background: "#dddddd" }}
                defaultValue={staffDeleteParam.staff_code}
              />
              {staffDeleteParam.staff_code}
              <br />
              <b>スタッフ名</b>
              <br />
              <input
                type="hidden"
                name="name"
                width="200px"
                readOnly
                style={{ background: "#dddddd" }}
                maxLength={staffNameMaxLegth}
                defaultValue={staff_name}
                //onChange={onChangeEvent}
              />
              {staff_name}
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
    // const refcomp_result = CompReferer(
    //   context.req.headers.referer,
    //   context.req.headers.host,
    //   previous_page
    // );
    const refcomp_result = true;
    //#endregion refererチェック
    let staffDeleteParam: StaffDeleteParam = {
      login: null,
      login_staff_code: "",
      login_staff_name: "",
      is_null_staffcode: false,
      is_noexist_staffcode: false,
      is_multipleexist_staffcode: false,
      is_exception: false,
      staff_code: "",
      staff_name: "",
      is_master: false,
    };

    const req = context.req;
    const res = context.res;

    if (refcomp_result) {
      // ログインチェック
      const login = req.session.get("login");
      if (login != void 0) {
        // ログイン済みだったら
        staffDeleteParam.login = login;
        staffDeleteParam.login_staff_code = req.session.get("staff_code");
        staffDeleteParam.login_staff_name = req.session.get("staff_name");
      } else {
        // 未ログインだったら
        return { props: staffDeleteParam };
      }

      //#region POSTメッセージからパラメータを取得する
      //console.log(context.query);
      // const body = await getRawBody(context.req);
      // const body_string = body.toString();
      // const body_json = formUrlDecoded(body_string);
      //console.log(body_json)
      const staffcode: string =
        typeof context.query.staffcode == "undefined" ||
        context.query.staffcode == "null"
          ? ""
          : htmlspecialchars(context.query.staffcode.toString());
      //console.log(staff_add_param);
      //#endregion POSTメッセージからパラメータを取得する

      if (staffcode != "") {
        staffDeleteParam.staff_code = staffcode;

        //#region DBへstaffを追加
        let is_exception: boolean = false;
        try {
          //#region DBアクセス
          const sql = `SELECT name,is_master FROM mst_staff WHERE code=${staffcode}`;
          const raw_staff: {
            name: string;
            is_master: boolean;
          }[] = await db.query(sql);
          //#endregion DBアクセス

          // RowDataPacket型からplain dataに変換
          const staff = JSON.parse(JSON.stringify(raw_staff));

          if (staff.length == 1) {
            const staff_name = staff[0].name;
            staffDeleteParam.staff_name = htmlspecialchars(staff_name);
            staffDeleteParam.is_master = staff[0].is_master;
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
  }
);

export default StaffEdit;
