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
  staffs: { name: string }[];
};

const dbWorkDirectory = path.join(process.cwd(), dbFilePath);

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
        {(() => {
          const items = [];
          staffListParam.staffs.map((staff) => {
            items.push(
              <div>
                {staff.name}
                <br />
              </div>
            );
          });
          return <div>{items}</div>;
        })()}
        {/*
        <form method="post" action="staff_branch.php">
          {staffListParam.staffs.map((staff) => {
            {staff.name}
          })}
        </form>
        */}
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

    const staffs = await db.all("SELECT name FROM mst_staff WHERE 1");
    staffs.map((name) => {
      staffListParam.staffs.push(name);
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
