/***************************************************
 *
 * スタッフ管理 メニュー画面
 *
 ***************************************************/
import React from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import path from "path";
import {
  msgElementHttpReqError,
  msgElementSystemError,
} from "../../lib/global_const";
import withSession from "../../lib/session";
import { msgYouHaveNotLogin } from "../../lib/global_const";
import db from "../../lib/db";
import { SQL } from "sql-template-strings";

type StaffListParam = {
  login: string;
  login_staff_code: string;
  login_staff_name: string;
  is_exception: boolean;
  staffs: {
    name: string;
    code: number;
    is_master: boolean;
  }[];
};

const next_page: string = "/staff/staff_branch";
// const previous_page: string = "/staff/staff_list";
// const redirect_page: string = "/staff/staff_list";

/**
 * スタッフ選択フォームを生成
 * @param staffListParam
 */
const GenSelectStaffFormChildren = (staffListParam: StaffListParam) => {
  const items = [];
  staffListParam.staffs.map((staff) => {
    items.push(
      <React.Fragment key={staff.code.toString()}>
        <input type="radio" name="staffcode" value={staff.code} />
        {staff.code}: {staff.name}
        {staff.is_master == true && "(マスター管理者)"}
        <br />
      </React.Fragment>
    );
  });
  return <React.Fragment>{items}</React.Fragment>;
};

/**
 * スタッフ ポータル
 * @param staffListParam
 */
const StaffList = (staffListParam: StaffListParam) => {
  const items = [];
  items.push(
    <React.Fragment>
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 スタッフ管理メニュー</title>
      </Head>
      {
        /* ログインしていたら */
        staffListParam.login != void 0 && (
          <React.Fragment>
            {staffListParam.login_staff_name}さん ログイン中
            <br />
          </React.Fragment>
        )
      }
      <h2>スタッフ管理 メニュー</h2>
    </React.Fragment>
  );

  if (staffListParam.login == void 0) {
    // ログインしていなかったら
    // 未ログインメッセージを表示
    items.push(msgYouHaveNotLogin);
  } else {
    if (!staffListParam.is_exception) {
      items.push(
        <React.Fragment>
          <br />
          {/* 分岐画面へ移行する */}
          {/*
        <form method="post" action="staff_branch">
        */}
          <form method="post" action={next_page}>
            <b>新規スタッフ 追加</b>
            <br />
            <input
              key="add"
              type="submit"
              name="add"
              value="追加"
              style={{ width: 128 }}
            />
            <br />
            <br />
            <br />
            <b>既存スタッフ 参照・修正・削除</b>
            <br />
            ※スタッフを選択し、操作したいボタンを押してください。
            <br />
            <br />
            {GenSelectStaffFormChildren(staffListParam)}
            <input key="disp" type="submit" name="disp" value="参照" />
            <input key="edit" type="submit" name="edit" value="修正" />
            <input key="delete" type="submit" name="delete" value="削除" />
          </form>
          <br />
          <Link href="/staff_login/staff_top">
            <a>ショップ管理トップメニューへ</a>
          </Link>
        </React.Fragment>
      );
    } else {
      //#region エラーメッセージを表示
      items.push(<React.Fragment>{msgElementSystemError}</React.Fragment>);
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
    let is_exception = false;
    let staffListParam: StaffListParam = {
      login: null,
      login_staff_code: "",
      login_staff_name: "",
      is_exception: is_exception,
      staffs: Array(),
    };

    const req = context.req;
    const res = context.res;

    // ログインチェック
    const login = req.session.get("login");
    if (login != void 0) {
      // ログイン済みだったら
      staffListParam.login = login;
      staffListParam.login_staff_code = req.session.get("staff_code");
      staffListParam.login_staff_name = req.session.get("staff_name");
    } else {
      // 未ログインだったら
      return { props: staffListParam };
    }

    //#region DBへstaffを追加
    try {
      //#region DBアクセス
      const sql = `SELECT code,name,is_master FROM mst_staff WHERE 1`;
      const raw_staffs: {
        code: string;
        name: string;
        is_master: boolean;
      }[] = await db.query(sql);
      //#endregion DBアクセス

      // RowDataPacket型からplain dataに変換
      const staffs = JSON.parse(JSON.stringify(raw_staffs));
      staffs.map((staff) => {
        staffListParam.staffs.push(staff);
      });
    } catch (e) {
      is_exception = true;
    } finally {
      staffListParam.is_exception = is_exception;
    }
    //#endregion DBへstaffを追加

    return {
      props: staffListParam,
    };
  }
);

export default StaffList;
