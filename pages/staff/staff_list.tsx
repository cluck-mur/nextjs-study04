/***************************************************
 *
 * スタッフ ポータル画面
 *
 ***************************************************/
import React from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import {
  dbFilePath,
  dbFileName,
  msgElementHttpReqError,
  msgElementSystemError,
} from "../../lib/global_const";

type StaffListParam = {
  is_exception: boolean;
  staffs: {
    name: string;
    code: number;
  }[];
};

/**
 * スタッフ選択フォームを生成
 * @param staffListParam
 */
const GenSelectStaffFormChildren = (staffListParam: StaffListParam) => {
  const items = [];
  staffListParam.staffs.map((staff) => {
    items.push(
      <React.Fragment>
        <input
          key={staff.code}
          type="radio"
          name="staffcode"
          value={staff.code}
        />
        {staff.code}: {staff.name}
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
        <title>ろくまる農園 スタッフ ポータル</title>
      </Head>
    </React.Fragment>
  );

  if (!staffListParam.is_exception) {
    items.push(
      <React.Fragment>
        <h2>スタッフ ポータル</h2>
        <br />
        {/* 分岐画面へ移行する */}
        {/*
        <form method="post" action="staff_branch">
        */}
        <form method="post" action="staff_edit">
          新たにスタッフを登録する場合にはこちら
          <br />
          <input type="submit" name="add" value="追加" style={{ width: 128 }} />
          <br />
          <br />
          <br />
          登録済みスタッフについての操作はこちら
          <br />
          ※スタッフを選択し、操作したい内容のボタンを押してください。
          <br />
          <br />
          {GenSelectStaffFormChildren(staffListParam)}
          <input type="submit" name="disp" value="参照" />
          <input type="submit" name="edit" value="修正" />
          <input type="submit" name="delete" value="削除" />
        </form>
      </React.Fragment>
    );
  } else {
    //#region エラーメッセージを表示
    items.push(<React.Fragment>{msgElementSystemError}</React.Fragment>)
    //#endregion エラーメッセージを表示
  }

  return <React.Fragment>{items}</React.Fragment>;
};

/**
 * SSR
 * @param context
 */
export const getServerSideProps: GetServerSideProps = async (context) => {
  //#region DBへstaffを追加
  // DBファイルのパスを取得
  const dbWorkDirectory = path.join(process.cwd(), dbFilePath);
  const filename: string = dbFileName;
  const fullPath: string = path.join(dbWorkDirectory, filename);

  let is_exception = false;
  let staffListParam: StaffListParam = {
    is_exception: is_exception,
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
  } finally {
    staffListParam.is_exception = is_exception;
  }
  //#endregion DBへstaffを追加

  return {
    props: staffListParam,
  };
};

export default StaffList;
