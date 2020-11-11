/***************************************************
 *
 * 商品修正画面
 *
 ***************************************************/
import React from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import path from "path";
import htmlspecialchars from "htmlspecialchars";
import {
  productNameMaxLegth,
  msgElementSystemError,
  msgElementProductWasNotSelected,
  msgElementProductWasNotExisted,
  msgElementProductWasMultipleExisted,
} from "../../lib/global_const";
import withSession from "../../lib/session";
import { msgYouHaveNotLogin } from "../../lib/global_const";
import db from "../../lib/db";
import { SQL } from "sql-template-strings";

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
  product_image_old: string;
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
  const product_image_old = productEditParam.product_image_old;
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
            <form method="post" action={next_page} encType="multipart/form-data">
              <b>商品コード</b>
              <br />
              {/* <input type="hidden" name="code" value={productEditParam.product_code} /> */}
              <input
                type="hidden"
                name="code"
                width="200px"
                // readOnly
                style={{ background: "#dddddd" }}
                defaultValue={productEditParam.product_code}
              />
              {productEditParam.product_code}
              <br />
              <b>商品名</b>
              <br />
              <input
                type="text"
                name="name"
                width="200px"
                maxLength={productNameMaxLegth}
                defaultValue={product_name}
                //onChange={onChangeEvent}
              />
              最大30文字
              <br />
              <b>価格</b>
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
              <b>画像を変更する</b>
              <br />
              <input type="radio" name="imagechange" value="no" defaultChecked={true} />いいえ
              <br />
              <input type="radio" name="imagechange" value="yes" />はい
              <br />
              <b>現在の画像</b>
              <br />
              <input
                type="hidden"
                name="image_old"
                width="200px"
                readOnly
                style={{ background: "#dddddd" }}
                defaultValue={product_image_old}
              />
              {product_image_old == void 0 || product_image_old == "" ? (
                <img src="/now_printing.png" />
              ) : (
                <p style={{ width: "150px", height: "150px" }}>
                  <img width="100%" src={"/upload/" + product_image_old} />
                </p>
              )}
              <br />
              <b>新しい画像</b>
              <br />
              <input type="file" name="image" width="400px" />
              <br />
              <small>※ファイルサイズ1Mバイト以下のjpegまたはpng</small>
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
      product_image_old: "",
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
        let is_exception: boolean = false;
        try {
          //#region DBアクセス
          const sql = `SELECT name,price,gazou FROM mst_product WHERE code=${productcode}`;
          const raw_product: {
            name: string;
            price: number;
            gazou: string;
          }[] = await db.query(sql);
          //#endregion DBアクセス

          // RowDataPacket型からplain dataに変換
          const product = JSON.parse(JSON.stringify(raw_product));

          if (product.length == 1) {
            const product_name =
              product[0].name == "undefined" ? "" : product[0].name;
            const product_price = product[0].price;
            const product_image =
              product[0].gazou == "undefined" ? "" : product[0].gazou;
            productEditParam.product_name = htmlspecialchars(product_name);
            productEditParam.product_price = htmlspecialchars(product_price);
            productEditParam.product_image = htmlspecialchars(product_image);
            productEditParam.product_image_old = productEditParam.product_image.toString();
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
