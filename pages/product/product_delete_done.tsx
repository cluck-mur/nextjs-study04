/***************************************************
 *
 * 商品削除 完了 画面
 *
 ***************************************************/
import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import getRawBody from "raw-body";
import formUrlDecoded from "form-urldecoded";
import htmlspecialchars from "htmlspecialchars";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import {
  dbFilePath,
  dbFileName,
  msgElementHttpReqError,
  msgElementSystemError,
} from "../../lib/global_const";
import { CompReferer } from "../../lib/myUtils";

type ProductDeleteDoneParam = {
  is_exception: boolean;
  product_code: string;
  product_name: string;
};

//const next_page: string = "/product/product_edit_check";
const previous_page: string = "/product/product_delete";
const redirect_page: string = "/product/product_list";
const return_page: string = "/product/product_list"

/**
 * 商品削除 完了
 * @param productDeleteDoneParam
 */
const ProductDeleteDone = (productDeleteDoneParam: ProductDeleteDoneParam) => {
  const router = useRouter();

  const items = [];
  items.push(
    <React.Fragment>
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 商品削除 完了</title>
      </Head>
      <h2>商品削除 完了</h2>
    </React.Fragment>
  );

  if (!productDeleteDoneParam.is_exception) {
    items.push(
      <React.Fragment>
        {productDeleteDoneParam.product_name} を削除しました。
        <br />
        <input type="button" onClick={() => {router.push(return_page)}} value="商品ポータルへ" />
      </React.Fragment>
    );
  } else {
    //#region エラーメッセージを表示
    if (productDeleteDoneParam.is_exception) {
      items.push(msgElementSystemError);
    }
    //#endregion エラーメッセージを表示
  }

  return <React.Fragment>{items}</React.Fragment>;
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

  //#region POSTメッセージからパラメータを取得する
  if (context.req.method == "POST" && refcomp_result) {
    let productDeleteDoneParam: ProductDeleteDoneParam = {
      is_exception: false,
      product_code: "",
      product_name: "",
    };

    const body = await getRawBody(context.req);
    const body_string = body.toString();
    const body_json = formUrlDecoded(body_string);

    const code = typeof body_json.code == "undefined" ? "" : body_json.code;
    const name = typeof body_json.name == "undefined" ? "" : body_json.name;

    //#region 前画面からデータを受け取る
    const product_code = htmlspecialchars(code);
    const product_name = htmlspecialchars(name);
    //#endregion 前画面からデータを受け取る

    //#region DBへproductを追加
    // DBファイルのパスを取得
    const dbWorkDirectory = path.join(process.cwd(), dbFilePath);
    const filename: string = dbFileName;
    const fullPath: string = path.join(dbWorkDirectory, filename);

    let is_exception = false;
    try {
      // DBオープン
      const db = await open({
        filename: fullPath,
        driver: sqlite3.Database,
      });
      //db.serialize();
      const sql = `DELETE FROM mst_product WHERE code=${product_code}`;
      let stmt = await db.prepare(sql);
      try {
        await stmt.run();
      } catch (e) {
        is_exception = true;
      } finally {
        await stmt.finalize();
      }
    } catch (e) {
      is_exception = true;
    } finally {
      // 処理なし
    }
    //#endregion DBへproductを追加

    productDeleteDoneParam.is_exception = is_exception;
    productDeleteDoneParam.product_code = product_code;
    productDeleteDoneParam.product_name = product_name;
    //console.log(product_add_param);

    return {
      props: productDeleteDoneParam,
    };
  } else {
    if (context.res) {
      context.res.writeHead(303, { Location: redirect_page });
      context.res.end();
    }

    return { props: {} };
  }
  //#endregion POSTメッセージからパラメータを取得する
};

export default ProductDeleteDone;
