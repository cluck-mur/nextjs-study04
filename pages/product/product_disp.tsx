/***************************************************
 *
 * 商品参照画面
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

type ProductDispParam = {
  is_null_productcode: boolean;
  is_noexist_productcode: boolean;
  is_multipleexist_productcode: boolean;
  is_exception: boolean;
  product_code: string;
  product_name: string;
  product_price: string;
  product_image: string;
};

const next_page: string = "/product/product_list";
const previous_page: string = "/product/product_list";
const redirect_page: string = "/product/product_list";
//const return_page: string = "/product/product_list";

/**
 * 商品修正
 * @param productDispParam
 */
const ProductDisp = (productDispParam: ProductDispParam) => {
  //#region 前画面からデータを受け取る
  const product_name = productDispParam.product_name;
  const product_price = productDispParam.product_price;
  const product_image = productDispParam.product_image;
  const router = useRouter();
  //#endregion 前画面からデータを受け取る

  const items = [];
  items.push(
    <React.Fragment>
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 商品参照</title>
      </Head>
      <h2>商品参照</h2>
    </React.Fragment>
  );

  if (!productDispParam.is_exception) {
    if (productDispParam.is_null_productcode) {
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
    } else if (productDispParam.is_noexist_productcode) {
      items.push(msgElementProductWasNotExisted);
      items.push(
        <React.Fragment>
          <br />
          商品コード: {productDispParam.product_code}
          <br />
          <input
            type="button"
            onClick={() => router.push(redirect_page)}
            value="戻る"
          />
        </React.Fragment>
      );
    } else if (productDispParam.is_multipleexist_productcode) {
      items.push(msgElementProductWasMultipleExisted);
      items.push(
        <React.Fragment>
          <br />
          商品コード: {productDispParam.product_code}
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
          {/* 商品コード
        <br />
        {productDispParam.product_code}
        <br /> */}
          {/* <form method="post" action={next_page}> */}
          商品コード
          <br />
          {/* <input type="hidden" name="code" value={productDispParam.product_code} /> */}
          <input
            type="text"
            name="code"
            width="200px"
            readOnly
            style={{ background: "#dddddd" }}
            defaultValue={productDispParam.product_code}
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
          価格
          <br />
          <input
            type="text"
            name="name"
            width="200px"
            readOnly
            style={{ background: "#dddddd" }}
            // maxLength={productNameMaxLegth}
            defaultValue={product_price}
            //onChange={onChangeEvent}
          />円
          <br />
          <br />
          <input type="button" onClick={() => router.back()} value="戻る" />
          {/* <input type="submit" value="OK" />
          </form> */}
        </React.Fragment>
      );
    }
  } else {
    //#region エラーメッセージを表示
    if (productDispParam.is_exception) {
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
    let productDispParam: ProductDispParam = {
      is_null_productcode: false,
      is_noexist_productcode: false,
      is_multipleexist_productcode: false,
      is_exception: false,
      product_code: null,
      product_name: "",
      product_price: null,
      product_image: "",
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
      productDispParam.product_code = productcode;

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

        const product: {
          name: string;
          price: string;
          image: string;
        }[] = await db.all(
          `SELECT name,price,gazou FROM mst_product WHERE code=${productcode}`
        );
        // console.log(product);
        if (product.length == 1) {
          const product_name = product[0].name == "undefined" ? "" : product[0].name;
          const product_price = product[0].price == "undefined" ? "" : product[0].price;
          const product_image = product[0].image == "undefined" ? "" : product[0].image;
          productDispParam.product_name = htmlspecialchars(product_name);
          productDispParam.product_price = htmlspecialchars(product_price);
          productDispParam.product_image = htmlspecialchars(product_image);
        } else if (product.length < 1) {
          productDispParam.is_noexist_productcode = true;
        } else {
          productDispParam.is_multipleexist_productcode = true;
        }
      } catch (e) {
        is_exception = true;
      } finally {
        productDispParam.is_exception = is_exception;
      }
    } else {
      productDispParam.is_null_productcode = true;
    }
    //#endregion DBへproductを追加
    return {
      props: productDispParam,
    };
  } else {
    if (context.res) {
      context.res.writeHead(303, { Location: redirect_page });
      context.res.end();
    }

    return { props: {} };
  }
};

export default ProductDisp;
