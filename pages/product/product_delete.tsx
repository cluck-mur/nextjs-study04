/***************************************************
 *
 * 商品削除画面
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
  productNameMaxLegth,
  msgElementSystemError,
  msgElementProductWasNotSelected,
  msgElementProductWasNotExisted,
  msgElementProductWasMultipleExisted,
} from "../../lib/global_const";

type ProductDeleteParam = {
  is_null_productcode: boolean;
  is_noexist_productcode: boolean;
  is_multipleexist_productcode: boolean;
  is_exception: boolean;
  product_code: string;
  product_name: string;
};

const next_page: string = "/product/product_delete_done";
const previous_page: string = "/product/product_list";
const redirect_page: string = "/product/product_list";

/**
 * 商品修正
 * @param productDeleteParam
 */
const ProductEdit = (productDeleteParam: ProductDeleteParam) => {
  //#region 前画面からデータを受け取る
  const product_name = productDeleteParam.product_name;
  const router = useRouter();
  //#endregion 前画面からデータを受け取る

  const items = [];
  items.push(
    <React.Fragment>
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 商品削除</title>
      </Head>
      <h2>商品削除</h2>
    </React.Fragment>
  );

  if (!productDeleteParam.is_exception) {
    if (productDeleteParam.is_null_productcode) {
      items.push(msgElementProductWasNotSelected);
      items.push(
        <React.Fragment>
          <br />
          <input
            type="button"
            onClick={() => router.push(redirect_page)}
            value="戻る"
          />
        </React.Fragment>
      );
    } else if (productDeleteParam.is_noexist_productcode) {
      items.push(msgElementProductWasNotExisted);
      items.push(
        <React.Fragment>
          <br />
          商品コード: {productDeleteParam.product_code} 
          <br />
          <input
            type="button"
            onClick={() => router.push(redirect_page)}
            value="戻る"
          />
        </React.Fragment>
      );
    } else if (productDeleteParam.is_multipleexist_productcode) {
      items.push(msgElementProductWasMultipleExisted)
      items.push(
        <React.Fragment>
          <br />
          商品コード: {productDeleteParam.product_code} 
          <br />
          <input
            type="button"
            onClick={() => router.push(redirect_page)}
            value="戻る"
          />
        </React.Fragment>
      );
    } else {
      items.push(
        <React.Fragment>
          ※商品を削除します。
          <br />
          <br />
          {/* 商品コード
        <br />
        {productDeleteParam.product_code}
        <br /> */}
          <form method="post" action={next_page}>
            この商品を削除してよろしいですか？
            <br />
            <br />
            商品コード
            <br />
            {/* <input type="hidden" name="code" value={productDeleteParam.product_code} /> */}
            <input
              type="text"
              name="code"
              width="200px"
              readOnly
              style={{ background: "#dddddd" }}
              defaultValue={productDeleteParam.product_code}
            />
            <br />
            商品名
            <br />
            <input
              type="text"
              name="name"
              width="200px"
              readOnly
              style={{ background: "#dddddd" }}
              maxLength={productNameMaxLegth}
              defaultValue={product_name}
              //onChange={onChangeEvent}
            />
            <br />
            <br />
            <input type="button" onClick={() => router.back()} value="戻る" />
            <input type="submit" value="OK" />
          </form>
        </React.Fragment>
      );
    }
  } else {
    //#region エラーメッセージを表示
    if (productDeleteParam.is_exception) {
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
  /*
  const refcomp_result = CompReferer(
    context.req.headers.referer,
    context.req.headers.host,
    previous_page
  );
  */
  const refcomp_result = true;
  //#endregion refererチェック

  if (refcomp_result) {
    let productDeleteParam: ProductDeleteParam = {
      is_null_productcode: false,
      is_noexist_productcode: false,
      is_multipleexist_productcode: false,
      is_exception: false,
      product_code: "",
      product_name: "",
    };

    //#region POSTメッセージからパラメータを取得する
    //console.log(context.query);
    // const body = await getRawBody(context.req);
    // const body_string = body.toString();
    // const body_json = formUrlDecoded(body_string);
    //console.log(body_json)
    const productcode: string =
      typeof context.query.productcode == "undefined" ||
      context.query.productcode == "null"
        ? ""
        : htmlspecialchars(context.query.productcode.toString());
    //console.log(product_add_param);
    //#endregion POSTメッセージからパラメータを取得する

    if (productcode != "") {
      productDeleteParam.product_code = productcode;

      //#region DBへproductを追加
      // DBファイルのパスを取得
      const dbWorkDirectory = path.join(process.cwd(), dbFilePath);
      const filename: string = dbFileName;
      const fullPath: string = path.join(dbWorkDirectory, filename);
      let is_exception: boolean = false;
      try {
        // DBオープン
        const db = await open({
          filename: fullPath,
          driver: sqlite3.Database,
        });
        //db.serialize();

        const product: { name: string }[] = await db.all(
          `SELECT name FROM mst_product WHERE code=${productcode}`
        );
        // console.log(product);
        if (product.length == 1) {
          const product_name = product[0].name;
          productDeleteParam.product_name = htmlspecialchars(product_name);
        } else if (product.length < 1) {
          productDeleteParam.is_noexist_productcode = true;
        } else {
          productDeleteParam.is_multipleexist_productcode = true;
        }
      } catch (e) {
        is_exception = true;
      } finally {
        productDeleteParam.is_exception = is_exception;
      }
    } else {
      productDeleteParam.is_null_productcode = true;
    }
    //#endregion DBへproductを追加
    return {
      props: productDeleteParam,
    };
  } else {
    if (context.res) {
      context.res.writeHead(303, { Location: redirect_page });
      context.res.end();
    }

    return { props: {} };
  }
};

export default ProductEdit;