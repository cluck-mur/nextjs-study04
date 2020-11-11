/***************************************************
 *
 * スタッフ参照画面
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

type StaffDispParam = {
  login: string;
  login_staff_code: string;
  login_staff_name: string;
  is_null_staffcode: boolean;
  is_noexist_staffcode: boolean;
  is_multipleexist_staffcode: boolean;
  is_exception: boolean;
  staff_code: string;
  staff_name: string;
};

const next_page: string = "/staff/staff_list";
const previous_page: string = "/staff/staff_list";
const redirect_page: string = "/staff/staff_list";
//const return_page: string = "/staff/staff_list";

/**
 * スタッフ修正
 * @param staffDispParam
 */
const StaffDisp = (staffDispParam: StaffDispParam) => {
  //#region 前画面からデータを受け取る
  const staff_name = staffDispParam.staff_name;
  const router = useRouter();
  //#endregion 前画面からデータを受け取る

  const items = [];
  items.push(
    <React.Fragment>
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 スタッフ参照</title>
      </Head>
      {
        /* ログインしていたら */
        staffDispParam.login != void 0 && (
          <React.Fragment>
            {staffDispParam.login_staff_name}さん ログイン中
            <br />
          </React.Fragment>
        )
      }
      <h2>スタッフ参照</h2>
    </React.Fragment>
  );

  if (staffDispParam.login == void 0) {
    // ログインしていなかったら
    // 未ログインメッセージを表示
    items.push(msgYouHaveNotLogin);
  } else {
    if (!staffDispParam.is_exception) {
      if (staffDispParam.is_null_staffcode) {
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
      } else if (staffDispParam.is_noexist_staffcode) {
        items.push(msgElementStaffWasNotExisted);
        items.push(
          <React.Fragment>
            <br />
            スタッフコード: {staffDispParam.staff_code}
            <br />
            <input
              type="button"
              onClick={() => router.push(redirect_page)}
              value="戻る"
            />
          </React.Fragment>
        );
      } else if (staffDispParam.is_multipleexist_staffcode) {
        items.push(msgElementStaffWasMultipleExisted);
        items.push(
          <React.Fragment>
            <br />
            スタッフコード: {staffDispParam.staff_code}
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
            {/* スタッフコード
        <br />
        {staffDispParam.staff_code}
        <br /> */}
            {/* <form method="post" action={next_page}> */}
            <b>スタッフコード</b>
            <br />
            {/* <input type="hidden" name="code" value={staffDispParam.staff_code} /> */}
            {/* <input
              type="text"
              name="code"
              width="200px"
              readOnly
              style={{ background: "#dddddd" }}
              defaultValue={staffDispParam.staff_code}
            /> */}
            {staffDispParam.staff_code}
            <br />
            <b>スタッフ名</b>
            <br />
            {/* <input
              type="text"
              name="name"
              width="200px"
              readOnly
              style={{ background: "#dddddd" }}
              maxLength={staffNameMaxLegth}
              defaultValue={staff_name}
              //onChange={onChangeEvent}
            /> */}
            {staff_name}
            <br />
            <br />
            <input type="button" onClick={() => router.back()} value="戻る" />
            {/* <input type="submit" value="OK" />
          </form> */}
          </React.Fragment>
        );
      }
    } else {
      //#region エラーメッセージを表示
      if (staffDispParam.is_exception) {
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

    let staffDispParam: StaffDispParam = {
      login: null,
      login_staff_code: "",
      login_staff_name: "",
      is_null_staffcode: false,
      is_noexist_staffcode: false,
      is_multipleexist_staffcode: false,
      is_exception: false,
      staff_code: "",
      staff_name: "",
    };

    const req = context.req;
    const res = context.res;

    if (refcomp_result) {
      // ログインチェック
      const login = req.session.get("login");
      if (login != void 0) {
        // ログイン済みだったら
        staffDispParam.login = login;
        staffDispParam.login_staff_code = req.session.get("staff_code");
        staffDispParam.login_staff_name = req.session.get("staff_name");
      } else {
        // 未ログインだったら
        return { props: staffDispParam };
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
        staffDispParam.staff_code = staffcode;

        //#region DBへstaffを追加
        let is_exception: boolean = false;
        try {
          //#region DBアクセス
          const sql = `SELECT name FROM mst_staff WHERE code=${staffcode}`;
          const raw_staff: { name: string }[] = await db.query(sql);
          //#endregion DBアクセス

          // RowDataPacket型からplain dataに変換
          const staff = JSON.parse(JSON.stringify(raw_staff));

          // console.log(staff);
          if (staff.length == 1) {
            const staff_name = staff[0].name;
            staffDispParam.staff_name = htmlspecialchars(staff_name);
          } else if (staff.length < 1) {
            staffDispParam.is_noexist_staffcode = true;
          } else {
            staffDispParam.is_multipleexist_staffcode = true;
          }
        } catch (e) {
          is_exception = true;
        } finally {
          staffDispParam.is_exception = is_exception;
        }
      } else {
        staffDispParam.is_null_staffcode = true;
      }
      //#endregion DBへstaffを追加
      return {
        props: staffDispParam,
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

export default StaffDisp;
