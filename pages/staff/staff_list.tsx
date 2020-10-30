/***************************************************
 *
 * スタッフリスト画面
 *
 ***************************************************/
import { GetServerSideProps } from "next";
import Head from "next/head";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { dbFilePath, dbFileName } from "../../lib/global_const";

type StaffListParam = {
  exception_occured_flg: boolean;
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
      <div key={staff.code}>
        <input
          type="radio"
          name="staffcode"
          value={staff.code}
        />
          {staff.name}
      </div>
    );
  });
  return <div>{items}</div>;
};

/**
 * スタッフリスト
 * @param staffListParam
 */
const StaffList = (staffListParam: StaffListParam) => {
  if (!staffListParam.exception_occured_flg) {
    return (
      <div>
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
      </div>
    );
  } else {
    return (
      <div>
        ただいま障害により大変ご迷惑をお掛けしております。
        <br />
      </div>
    );
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
  let exception_occured_flg = false;
  let staffListParam: StaffListParam = {
    exception_occured_flg: exception_occured_flg,
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
    exception_occured_flg = true;
  } finally {
    staffListParam.exception_occured_flg = exception_occured_flg;
  }
  //#endregion DBへstaffを追加

  return {
    props: staffListParam,
  };
};

export default StaffList;
