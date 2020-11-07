/***************************************************
 *
 * 商品修正画面
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

type ProductEditParam = {
  login: string;
  login_staff_code: string;
  login_staff_name: string;
  is_null_productcode: boolean;
  is_noexist_productcode: boolean;
  is_multipleexist_productcode: boolean;
  is_exception: boolean;
  product_code: string;
  product_name: string;
  product_price: string;
  product_image: string;
};

const next_page: string = "/product/product_edit_check";
const previous_page: string = "/product/product_list";
const redirect_page: string = "/product/product_list";

/**
 * 商品修正
 * @param productEditParam
 */
const ProductEdit = (productEditParam: ProductEditParam) => {
  //#region 前画面からデータを受け取る
  const product_name = productEditParam.product_name;
  const product_image = productEditParam.product_image;
  const router = useRouter();
  //#endregion 前画面からデータを受け取る

  const items = [];
  items.push(
    <React.Fragment>
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 商品修正</title>
      </Head>
      {
        /* ログインしていたら */
        productEditParam.login != void 0 && (
          <React.Fragment>
            {productEditParam.login_staff_name}さん ログイン中
            <br />
          </React.Fragment>
        )
      }
      <h2>商品修正</h2>
    </React.Fragment>
  );
  if (productEditParam.login == void 0) {
    // ログインしていなかったら
    // 未ログインメッセージを表示
    items.push(msgYouHaveNotLogin);
  } else {
    if (!productEditParam.is_exception) {
      if (productEditParam.is_null_productcode) {
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
      } else if (productEditParam.is_noexist_productcode) {
        items.push(msgElementProductWasNotExisted);
        items.push(
          <React.Fragment>
            <br />
            商品コード: {productEditParam.product_code}
            <br />
            <input
              type="button"
              onClick={() => router.push(redirect_page)}
              value="戻る"
            />
          </React.Fragment>
        );
      } else if (productEditParam.is_multipleexist_productcode) {
        items.push(msgElementProductWasMultipleExisted);
        items.push(
          <React.Fragment>
            <br />
            商品コード: {productEditParam.product_code}
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
            ※商品の名前と価格と画像を変更します。
            <br />
            <br />
            {/* 商品コード
        <br />
        {productEditParam.product_code}
        <br /> */}
            <form method="post" action={next_page}>
              商品コード
              <br />
              {/* <input type="hidden" name="code" value={productEditParam.product_code} /> */}
              <input
                type="text"
                name="code"
                width="200px"
                readOnly
                style={{ background: "#dddddd" }}
                defaultValue={productEditParam.product_code}
              />
              <br />
              商品名
              <br />
              <input
                type="text"
                name="name"
                width="200px"
                maxLength={productNameMaxLegth}
                defaultValue={product_name}
                //onChange={onChangeEvent}
              />
              最大14文字
              <br />
              価格
              <br />
              <input
                type="text"
                name="price"
                width="200px"
                // maxLength={productNameMaxLegth}
                defaultValue={productEditParam.product_price}
                //onChange={onChangeEvent}
              />
              円
              <br />
              画像
              <br />
              <input
                type="text"
                name="image"
                width="200px"
                // maxLength={productNameMaxLegth}
                defaultValue={productEditParam.product_image}
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
      if (productEditParam.is_exception) {
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

    let productEditParam: ProductEditParam = {
      login: null,
      login_staff_code: "",
      login_staff_name: "",
      is_null_productcode: false,
      is_noexist_productcode: false,
      is_multipleexist_productcode: false,
      is_exception: false,
      product_code: "",
      product_name: "",
      product_price: "",
      product_image: "",
    };

    const req = context.req;
    const res = context.res;

    if (refcomp_result) {
      // ログインチェック
      const login = req.session.get("login");
      if (login != void 0) {
        // ログイン済みだったら
        productEditParam.login = login;
        productEditParam.login_staff_code = req.session.get("staff_code");
        productEditParam.login_staff_name = req.session.get("staff_name");
      } else {
        // 未ログインだったら
        return { props: productEditParam };
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
        productEditParam.product_code = productcode;

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
            price: number;
            image: string;
          }[] = await db.all(
            `SELECT name,price,gazou FROM mst_product WHERE code=${productcode}`
          );
          // console.log(product);
          if (product.length == 1) {
            const product_name =
              product[0].name == "undefined" ? "" : product[0].name;
            const product_price = product[0].price;
            const product_image =
              product[0].image == "undefined" ? "" : product[0].image;
            productEditParam.product_name = htmlspecialchars(product_name);
            productEditParam.product_price = htmlspecialchars(product_price);
            productEditParam.product_image = htmlspecialchars(product_image);
          } else if (product.length < 1) {
            productEditParam.is_noexist_productcode = true;
          } else {
            productEditParam.is_multipleexist_productcode = true;
          }
        } catch (e) {
          is_exception = true;
        } finally {
          productEditParam.is_exception = is_exception;
        }
      } else {
        productEditParam.is_null_productcode = true;
      }
      //#endregion DBへproductを追加

      return {
        props: productEditParam,
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
