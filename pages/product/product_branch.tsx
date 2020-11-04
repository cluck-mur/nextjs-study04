/***************************************************
 *
 * 商品管理 分岐画面
 *
 ***************************************************/
import React from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import getRawBody from "raw-body";
import formUrlDecoded from "form-urldecoded";
import htmlspecialchars from "htmlspecialchars";
import {
  dbFilePath,
  dbFileName,
  msgElementHttpReqError,
  msgElementSystemError,
} from "../../lib/global_const";
import { CompReferer } from "../../lib/myUtils";

type ProductBranchParam = {
  is_exception: boolean;
  product_code: number;
  product_name: string;
};

const next_page_add: string = "/product/product_add";
const next_page_edit: string = "/product/product_edit";
const next_page_delete: string = "/product/product_delete";
const next_page_disp: string = "/product/product_disp";
const previous_page: string = "/product/product_list";
const redirect_page: string = "/product/product_list";

/**
 * 商品修正 入力値チェック
 * @param productBranchkParam
 */
const StaffBranch = (productBranchParam: ProductBranchParam) => {
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

  if (context.req.method == "POST" && refcomp_result) {
    const body = await getRawBody(context.req);
    const body_string = body.toString();
    const body_json = formUrlDecoded(body_string);
    //console.log(body_json);

    const productcode = typeof body_json.productcode == "undefined" ? null : body_json.productcode;

    //#region ページ分岐
    if (body_json.add != undefined) {
      if (context.res) {
        context.res.writeHead(303, { Location: next_page_add });
        context.res.end();
      }
    }
    if (body_json.disp != undefined) {
      if (context.res) {
        context.res.writeHead(303, { Location: next_page_disp + `?productcode=${productcode}` });
        context.res.end();
      }
    }
    if (body_json.edit != undefined) {
      if (context.res) {
        context.res.writeHead(303, { Location: next_page_edit + `?productcode=${productcode}` });
        context.res.end();
      }
    }
    if (body_json.delete != undefined) {
      if (context.res) {
        context.res.writeHead(303, { Location: next_page_delete + `?productcode=${productcode}` });
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
