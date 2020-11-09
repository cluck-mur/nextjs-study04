import React from "react";
import Link from "next/link";

export const dbFilePath: string = ".db_work";
export const dbFileName: string = "MyDb.sqlite";
export const uploadFilePath: string = "public/upload";

export const staffNameMaxLegth: number = 14;
export const productNameMaxLegth: number = 30;
export const productImageMaxLegth: number = 30;

export const msgElementHttpReqError = (
  <React.Fragment key="http_request_error">
    原因不明のエラーが発生しました。
    <br />
    申し訳ありませんがもう一度やり直してください。
  </React.Fragment>
);

export const msgElementSystemError = (
  <React.Fragment key="system_error">
    ただいま障害により大変ご迷惑をお掛けしております。
  </React.Fragment>
);

export const msgElementStaffWasNotSelected = (
  <React.Fragment>スタッフが選択されていません。</React.Fragment>
);

export const msgElementStaffWasNotExisted = (
  <React.Fragment>指定されたスタッフは存在しません。</React.Fragment>
);

export const msgElementStaffWasMultipleExisted = (
  <React.Fragment>指定されたスタッフが複数存在します。</React.Fragment>
);

export const msgElementProductWasNotSelected = (
  <React.Fragment>商品が選択されていません。</React.Fragment>
);

export const msgElementProductWasNotExisted = (
  <React.Fragment>指定された商品は存在しません。</React.Fragment>
);

export const msgElementProductWasMultipleExisted = (
  <React.Fragment>指定された商品が複数存在します。</React.Fragment>
);

export const msgYouHaveNotLogin = (
  <React.Fragment key="have_not_login">
    ログインしていません。
    <br />
    <Link href="/staff_login/staff_login">
      <a>ログイン画面へ</a>
    </Link>
  </React.Fragment>
);
