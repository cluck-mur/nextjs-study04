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
import withSession from "../../lib/session";
import { msgYouHaveNotLogin } from "../../lib/global_const";

type ProductDeleteParam = {
  login: string;
  login_staff_code: string;
  login_staff_name: string;
  is_null_productcode: boolean;
  is_noexist_productcode: boolean;
  is_multipleexist_productcode: boolean;
  is_exception: boolean;
  product_code: string;
  product_name: string;
  product_image: string;
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
  const product_image = productDeleteParam.product_image;
  const router = useRouter();
  //#endregion 前画面からデータを受け取る

  const items = [];
  items.push(
    <React.Fragment>
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 商品削除</title>
      </Head>
      {
        /* ログインしていたら */
        productDeleteParam.login != void 0 && (
          <React.Fragment>
            {productDeleteParam.login_staff_name}さん ログイン中
            <br />
          </React.Fragment>
        )
      }
      <h2>商品削除</h2>
    </React.Fragment>
  );

  if (productDeleteParam.login == void 0) {
    // ログインしていなかったら
    // 未ログインメッセージを表示
    items.push(msgYouHaveNotLogin);
  } else {
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
        items.push(msgElementProductWasMultipleExisted);
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
              <b>商品コード</b>
              <br />
              {/* <input type="hidden" name="code" value={productDeleteParam.product_code} /> */}
              <input
                type="hidden"
                name="code"
                width="200px"
                readOnly
                style={{ background: "#dddddd" }}
                defaultValue={productDeleteParam.product_code}
              />
              {productDeleteParam.product_code}
              <br />
              <b>商品名</b>
              <br />
              <input
                type="hidden"
                name="name"
                width="200px"
                readOnly
                style={{ background: "#dddddd" }}
                maxLength={productNameMaxLegth}
                defaultValue={product_name}
                //onChange={onChangeEvent}
              />
              {product_name}
              <br />
              <b>画像</b>
              <br />
              <input
                type="hidden"
                name="image"
                width="200px"
                readOnly
                style={{ background: "#dddddd" }}
                defaultValue={product_image}
              />
              {product_image == void 0 || product_image == "" ? (
                <img src="/now_printing.png" />
              ) : (
                <p style={{ width: "150px", height: "150px" }}>
                  <img width="100%" src={"/upload/" + product_image} />
                </p>
              )}
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
  }

  return <React.Fragment>{items}</React.Fragment>;
};

/**
 * SSR
 * @param context
 */
export const getServerSideProps: GetServerSideProps = withSession(
  async (context) => {
    //#region refererチェック
    // const refcomp_result = CompReferer(
    //   context.req.headers.referer,
    //   context.req.headers.host,
    //   previous_page
    // );
    const refcomp_result = true;
    //#endregion refererチェック

    let productDeleteParam: ProductDeleteParam = {
      login: null,
      login_staff_code: "",
      login_staff_name: "",
      is_null_productcode: false,
      is_noexist_productcode: false,
      is_multipleexist_productcode: false,
      is_exception: false,
      product_code: "",
      product_name: "",
      product_image: "",
    };

    const req = context.req;
    const res = context.res;

    if (refcomp_result) {
      // ログインチェック
      const login = req.session.get("login");
      if (login != void 0) {
        // ログイン済みだったら
        productDeleteParam.login = login;
        productDeleteParam.login_staff_code = req.session.get("staff_code");
        productDeleteParam.login_staff_name = req.session.get("staff_name");
      } else {
        // 未ログインだったら
        return { props: productDeleteParam };
      }

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

          const product: {
            name: string;
            gazou: string;
          }[] = await db.all(
            `SELECT name,gazou FROM mst_product WHERE code=${productcode}`
          );
          // console.log(product);
          if (product.length == 1) {
            const product_name = product[0].name;
            const product_image = product[0].gazou;
            productDeleteParam.product_name = htmlspecialchars(product_name);
            productDeleteParam.product_image = htmlspecialchars(product_image);
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
  }
);

export default ProductEdit;
