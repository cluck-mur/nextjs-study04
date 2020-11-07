/***************************************************
 *
 * スタッフログイン 入力値チェック 画面
 *
 ***************************************************/
import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import getRawBody from "raw-body";
import formUrlDecoded from "form-urldecoded";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import htmlspecialchars from "htmlspecialchars";
import md5 from "md5";
import withSession from "../../lib/session";
// import { applySession } from "next-iron-session";
import {
  dbFilePath,
  dbFileName,
  msgElementHttpReqError,
  msgElementSystemError,
  msgElementStaffWasNotSelected,
  msgElementStaffWasNotExisted,
  msgElementStaffWasMultipleExisted,
} from "../../lib/global_const";
import { CompReferer } from "../../lib/myUtils";
import { Session } from "inspector";

type StaffLoginCheckParam = {
  is_exception: boolean;
  is_noexist_staffcode: boolean;
  is_multipleexist_staffcode: boolean;
  code: string | undefined;
  name: string | undefined;
  pass: string | undefined;
};

const next_page: string = "/staff_login/staff_top";
const previous_page: string = "/staff_login/staff_login";
const redirect_page: string = "/staff_login/staff_login";

/**
 * スタッフログイン 入力値チェック
 * @param staffLoginCheckParam
 */
const StaffLoginCheck = (staffLoginCheckParam: StaffLoginCheckParam) => {
  //#region 前画面からデータを受け取る
  const staff_name = staffLoginCheckParam.name;
  let staff_pass = staffLoginCheckParam.pass;
  //#endregion 前画面からデータを受け取る
  const router = useRouter();

  const items = [];
  items.push(
    <React.Fragment key="head">
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 スタッフログインエラー</title>
      </Head>
      <h2>スタッフログイン エラー</h2>
    </React.Fragment>
  );

  if (!staffLoginCheckParam.is_exception) {
    let is_no_staffcode = false;
    if (staffLoginCheckParam.code == "") {
      is_no_staffcode = true;
      items.push(
        <React.Fragment>
          スタッフコードが入力されていません。
          <br />
        </React.Fragment>
      );
    }

    let is_no_password = false;
    if (staffLoginCheckParam.pass == "") {
      is_no_password = true;
      items.push(
        <React.Fragment>
          パスワードが入力されていません。
          <br />
        </React.Fragment>
      );
    }

    if (!is_no_staffcode && !is_no_password) {
      if (staffLoginCheckParam.is_noexist_staffcode) {
        items.push(
          <React.Fragment>
            スタッフコード または パスワード を間違えています。
            <br />
          </React.Fragment>
        );
        items.push(
          <React.Fragment>
            スタッフコード: {staffLoginCheckParam.code}
            <br />
          </React.Fragment>
        );
      }
      if (staffLoginCheckParam.is_multipleexist_staffcode) {
        items.push(msgElementStaffWasMultipleExisted);
        items.push(
          <React.Fragment>
            スタッフコード: {staffLoginCheckParam.code}
            <br />
          </React.Fragment>
        );
      }
    }
    items.push(
      <React.Fragment>
        <br />
        <input type="button" onClick={() => router.back()} value="戻る" />
      </React.Fragment>
    );
  } else {
    if (staffLoginCheckParam.is_exception) {
      items.push(msgElementSystemError);
    }
  }

  return <React.Fragment>{items}</React.Fragment>;
};

/**
 * SSR
 * @param context
 */
// export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
export const getServerSideProps: GetServerSideProps = withSession(
  async (context) => {
    const req = context.req;
    const res = context.res;

    let staffLoginCheckParam: StaffLoginCheckParam = {
      is_exception: false,
      is_noexist_staffcode: false,
      is_multipleexist_staffcode: false,
      code: "",
      name: "",
      pass: "",
    };

    //#region refererチェック
    const refcomp_result = CompReferer(
      req.headers.referer,
      req.headers.host,
      previous_page
    );
    //#endregion refererチェック

    // await applySession(req, res, {
    //   password: process.env.SECRET_COOKIE_PASSWORD,
    //   cookieName: "nextjs-study04",
    //   cookieOptions: {
    //     // the next line allows to use the session in non-https environements like
    //     // Next.js dev mode (http://localhost:3000)
    //     secure: process.env.NODE_ENV === "production",
    //   },
    // });

    if (req.method == "POST" && refcomp_result) {
      //#region POSTメッセージからパラメータを取得する
      const body = await getRawBody(req);
      const body_string = body.toString();
      const body_json = formUrlDecoded(body_string);
      //console.log(body_json)

      const code = typeof body_json.code == "undefined" ? "" : body_json.code;
      const pass = typeof body_json.pass == "undefined" ? "" : body_json.pass;
      //console.log(staff_add_param);

      staffLoginCheckParam.code = htmlspecialchars(code);
      staffLoginCheckParam.pass = htmlspecialchars(pass);
      //#endregion POSTメッセージからパラメータを取得する

      if (staffLoginCheckParam.code != "" && staffLoginCheckParam.pass != "") {
        // パスワードをハッシュ化
        staffLoginCheckParam.pass = md5(staffLoginCheckParam.pass);

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
            `SELECT name FROM mst_staff WHERE code=${staffLoginCheckParam.code} AND password="${staffLoginCheckParam.pass}"`
          );
          // console.log(staff);
          if (staff.length == 1) {
            const staff_name = staff[0].name;
            staffLoginCheckParam.name = htmlspecialchars(staff_name);
          } else if (staff.length < 1) {
            staffLoginCheckParam.is_noexist_staffcode = true;
          } else {
            staffLoginCheckParam.is_multipleexist_staffcode = true;
          }
        } catch (e) {
          is_exception = true;
        } finally {
          staffLoginCheckParam.is_exception = is_exception;
        }

        if (
          !staffLoginCheckParam.is_exception &&
          !staffLoginCheckParam.is_noexist_staffcode &&
          !staffLoginCheckParam.is_multipleexist_staffcode
        ) {
          // ログイン成功したら
          req.session.set("login", 1);
          req.session.set("staff_code", staffLoginCheckParam.code);
          req.session.set("staff_name", staffLoginCheckParam.name);
          await req.session.save();

          if (res) {
            res.writeHead(303, { Location: next_page });
            res.end();
          }
        }
      }

      return {
        props: staffLoginCheckParam,
      };
    } else {
      if (res) {
        res.writeHead(303, { Location: redirect_page });
        res.end();
      }

      return { props: {} };
    }
  }
);

export default StaffLoginCheck;
