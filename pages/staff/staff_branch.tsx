/***************************************************
 *
 * スタッフ管理 分岐画面
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
  msgElementHttpReqError,
  msgElementSystemError,
} from "../../lib/global_const";
import { CompReferer } from "../../lib/myUtils";
import { myParse, sanitizeFields } from "../../lib/myUtils";

type StaffBranchParam = {
  is_exception: boolean;
  staff_code: number;
  staff_name: string;
};

const next_page_add: string = "/staff/staff_add";
const next_page_edit: string = "/staff/staff_edit";
const next_page_delete: string = "/staff/staff_delete";
const next_page_disp: string = "/staff/staff_disp";
const previous_page: string = "/staff/staff_list";
const redirect_page: string = "/staff/staff_list";

/**
 * スタッフ修正 入力値チェック
 * @param staffBranchkParam
 */
const StaffBranch = (staffBranchParam: StaffBranchParam) => {
  return <React.Fragment></React.Fragment>;
};

/**
 * SSR
 * @param context
 */
export const getServerSideProps: GetServerSideProps = async (context) => {
  //#region refererチェック
  const refcomp_result = CompReferer(
    context.req.headers.referer,
    context.req.headers.host,
    previous_page
  );
  //#endregion refererチェック

  const req = context.req;

  if (context.req.method == "POST" && refcomp_result) {
    const body = await myParse(req);
    //const body_json = body.json();
    const fields_json = sanitizeFields(body);
    //console.log(body_json);

    const staffcode =
      typeof fields_json.staffcode == "undefined"
        ? null
        : fields_json.staffcode;

    //#region ページ分岐
    if (fields_json.add != undefined) {
      if (context.res) {
        context.res.writeHead(303, { Location: next_page_add });
        context.res.end();
      }
    }
    if (fields_json.disp != undefined) {
      if (context.res) {
        context.res.writeHead(303, {
          Location: next_page_disp + `?staffcode=${staffcode}`,
        });
        context.res.end();
      }
    }
    if (fields_json.edit != undefined) {
      if (context.res) {
        context.res.writeHead(303, {
          Location: next_page_edit + `?staffcode=${staffcode}`,
        });
        context.res.end();
      }
    }
    if (fields_json.delete != undefined) {
      if (context.res) {
        context.res.writeHead(303, {
          Location: next_page_delete + `?staffcode=${staffcode}`,
        });
        context.res.end();
      }
    }
    //#endregion ページ分岐

    return {
      props: {},
    };
  } else {
    if (context.res) {
      context.res.writeHead(303, { Location: redirect_page });
      context.res.end();
    }

    return { props: {} };
  }
};

export default StaffBranch;
