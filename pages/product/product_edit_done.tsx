/***************************************************
 *
 * 商品修正 完了 画面
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

type ProductEditDoneParam = {
  is_exception: boolean;
  product_code: string;
  product_name: string;
  product_price: string;
  product_image: string;
};

const previous_page: string = "/product/product_edit_check";
const redirect_page: string = "/product/product_edit";
const return_page: string = "/product/product_list"

/**
 * 商品修正 完了
 * @param productEditDoneParam
 */
const ProductEditDone = (productEditDoneParam: ProductEditDoneParam) => {
  const router = useRouter();

  const items = [];
  items.push(
    <React.Fragment key="head">
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 商品修正 完了</title>
      </Head>
      <h2>商品修正 完了</h2>
    </React.Fragment>
  );

  if (!productEditDoneParam.is_exception) {
    items.push(
      <React.Fragment key="success">
        {productEditDoneParam.product_name} を修正しました。
        <br />
        <input type="button" onClick={() => {router.push(return_page)}} value="商品管理ポータルへ" />
      </React.Fragment>
    );
  } else {
    //#region エラーメッセージを表示
    if (productEditDoneParam.is_exception) {
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

  if (context.req.method == "POST" && refcomp_result) {
    let productEditDoneParam: ProductEditDoneParam = {
      is_exception: false,
      product_code: "",
      product_name: "",
      product_price: "",
      product_image: "",
    };

    //#region POSTメッセージからパラメータを取得する
    const body = await getRawBody(context.req);
    const body_string = body.toString();
    const body_json = formUrlDecoded(body_string);

    const code = typeof body_json.code == "undefined" ? "" : body_json.code;
    const name = typeof body_json.name == "undefined" ? "" : body_json.name;
    const price = typeof body_json.price == "undefined" ? "" : body_json.price;

    const product_code = htmlspecialchars(code);
    const product_name = htmlspecialchars(name);
    const product_price = htmlspecialchars(price);
    //#endregion POSTメッセージからパラメータを取得する

    //#region DBへproductを修正
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
      const sql = `UPDATE mst_product SET name="${product_name}",price=${product_price} WHERE code=${product_code}`;
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
    //#endregion DBへproductを修正

    productEditDoneParam.is_exception = is_exception;
    productEditDoneParam.product_name = product_name;
    productEditDoneParam.product_price = product_price;
    //console.log(product_edit_param);

    return {
      props: productEditDoneParam,
    };
  } else {
    if (context.res) {
      context.res.writeHead(303, { Location: redirect_page });
      context.res.end();
    }

    return { props: {} };
  }
};

export default ProductEditDone;
