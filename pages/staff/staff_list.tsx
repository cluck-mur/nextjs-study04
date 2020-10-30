/***************************************************
 *
 * スタッフリスト画面
 *
 ***************************************************/
import React from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { dbFilePath, dbFileName } from "../../lib/global_const";
import { GenJsxMessage } from "../../lib/myUtils";

type StaffListParam = {
  is_exception: boolean;
  display_message: string[];
  staffs: {
    name: string;
    code: number;
  }[];
};

const dbWorkDirectory = path.join(process.cwd(), dbFilePath);

/**
 * スタッフ選択フォームを生成
 * @param staffListParam
 */
const GenSelectStaffFormChildren = (staffListParam: StaffListParam) => {
  const items = [];
  staffListParam.staffs.map((staff) => {
    items.push(
      <React.Fragment key={staff.code}>
        <input type="radio" name="staffcode" value={staff.code} />
        {staff.name}
        <br />
      </React.Fragment>
    );
  });
  return <React.Fragment>{items}</React.Fragment>;
};

/**
 * スタッフリスト
 * @param staffListParam
 */
const StaffList = (staffListParam: StaffListParam) => {
  if (!staffListParam.is_exception) {
    return (
      <React.Fragment>
        <Head>
          <meta charSet="UTF-8" />
          <title>ろくまる農園 スタッフ一覧</title>
        </Head>
        スタッフ一覧
        <br />
        <br />
        {/* 分岐画面へ移行する */}
        {/*
        <form method="post" action="staff_branch">
        */}
        <form method="post" action="staff_edit">
          {GenSelectStaffFormChildren(staffListParam)}
          <input type="submit" name="disp" value="参照" />
          <input type="submit" name="add" value="追加" />
          <input type="submit" name="edit" value="修正" />
          <input type="submit" name="delete" value="削除" />
        </form>
      </React.Fragment>
    );
  } else {
    return GenJsxMessage(staffListParam.display_message);
  }
};

/**
 * SSR
 * @param context
 */
export const getServerSideProps: GetServerSideProps = async (context) => {
  //#region DBへstaffを追加
  // DBファイルのパスを取得
  const filename: string = dbFileName;
  const fullPath: string = path.join(dbWorkDirectory, filename);

  let is_exception = false;
  const display_message: string[] = [];
  let staffListParam: StaffListParam = {
    is_exception: is_exception,
    display_message: [],
    staffs: Array(),
  };
  try {
    // DBオープン
    const db = await open({
      filename: fullPath,
      driver: sqlite3.Database,
    });
    //db.serialize();

    const staffs = await db.all("SELECT code,name FROM mst_staff WHERE 1");
    staffs.map((staff) => {
      staffListParam.staffs.push(staff);
    });
    //console.log(staffListParam);
  } catch (e) {
    is_exception = true;
    display_message.push("ただいま障害により大変ご迷惑をお掛けしております。");
  } finally {
    staffListParam.is_exception = is_exception;
    staffListParam.display_message = display_message;
  }
  //#endregion DBへstaffを追加

  return {
    props: staffListParam,
  };
};

export default StaffList;
