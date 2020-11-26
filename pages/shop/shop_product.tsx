/***************************************************
 *
 * 商品参照画面
 *
 ***************************************************/
import React from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
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
import { msgYouHaveNotLogin, imageServer1stPath } from "../../lib/global_const";
import db from "../../lib/db";
import { SQL } from "sql-template-strings";

type ShopProductParam = {
  login: string;
  login_customer_code: string;
  login_customer_name: string;
  is_null_productcode: boolean;
  is_noexist_productcode: boolean;
  is_multipleexist_productcode: boolean;
  is_exception: boolean;
  product_code: string;
  product_name: string;
  product_price: string;
  product_image: string;
};

const next_page: string = "/shop/shop_list";
const previous_page: string = "/shop/shop_list";
const redirect_page: string = "/shop/shop_list";

/**
 * 商品修正
 * @param productDispParam
 */
const ShopProduct = (shopProductParam: ShopProductParam) => {
  //#region 前画面からデータを受け取る
  const product_name = shopProductParam.product_name;
  const product_price = shopProductParam.product_price;
  const product_image = shopProductParam.product_image;
  const router = useRouter();
  //#endregion 前画面からデータを受け取る

  const items = [];
  items.push(
    <React.Fragment>
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 商品詳細情報</title>
      </Head>
      {
        /* ログインしていたら */
        shopProductParam.login != void 0 ? (
          <React.Fragment>
            ようこそ {shopProductParam.login_customer_name} 様
            <br />
            <Link href="member_logout">
              <a>ログアウト</a>
            </Link>
            <br />
            <br />
          </React.Fragment>
        ) : (
          <React.Fragment>
            ようこそ ゲスト 様
            <br />
            <Link href="member_login">
              <a>会員ログイン</a>
            </Link>
            <br />
            {/* <br /> */}
          </React.Fragment>
        )
      }
      <h2>商品詳細情報</h2>
    </React.Fragment>
  );

  if (!shopProductParam.is_exception) {
    if (shopProductParam.is_null_productcode) {
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
    } else if (shopProductParam.is_noexist_productcode) {
      items.push(msgElementProductWasNotExisted);
      items.push(
        <React.Fragment>
          <br />
          商品コード: {shopProductParam.product_code}
          <br />
          <input
            type="button"
            onClick={() => router.push(redirect_page)}
            value="戻る"
          />
        </React.Fragment>
      );
    } else if (shopProductParam.is_multipleexist_productcode) {
      items.push(msgElementProductWasMultipleExisted);
      items.push(
        <React.Fragment>
          <br />
          商品コード: {shopProductParam.product_code}
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
          <b>商品コード</b>
          <br />
          {/* <input
              type="text"
              name="code"
              width="200px"
              readOnly
              style={{ background: "#dddddd" }}
              defaultValue={productDispParam.product_code}
            /> */}
          {shopProductParam.product_code}
          <br />
          <b>商品名</b>
          <br />
          {/* <input
              type="text"
              name="name"
              width="200px"
              readOnly
              style={{ background: "#dddddd" }}
              maxLength={productNameMaxLegth}
              defaultValue={product_name}
              //onChange={onChangeEvent}
            /> */}
          {product_name}
          <br />
          <b>価格</b>
          <br />
          {/* <input
              type="text"
              name="name"
              width="200px"
              readOnly
              style={{ background: "#dddddd" }}
              // maxLength={productNameMaxLegth}
              defaultValue={product_price}
              //onChange={onChangeEvent}
            /> */}
          {product_price}
          円
          <br />
          <b>画像</b>
          <br />
          {/* <input
              type="text"
              name="name"
              width="200px"
              readOnly
              style={{ background: "#dddddd" }}
              // maxLength={productNameMaxLegth}
              defaultValue={product_price}
              //onChange={onChangeEvent}
            /> */}
          {product_image == void 0 || product_image == "" ? (
            <img src="/now_printing.png" />
          ) : (
            <p style={{ width: "150px", height: "150px" }}>
              {/* <img width="100%" src={"/upload/" + product_image} /> */}
              <img
                width="100%"
                src={`${imageServer1stPath}${product_image}?path=${encodeURIComponent(
                  "/upload/" + product_image
                )}`}
              />
            </p>
          )}
          <br />
          <br />
          <input type="button" onClick={() => router.push(`shop_cartin?productcode=${shopProductParam.product_code}`)} value="カートに入れる" />
          <input type="button" onClick={() => router.back()} value="戻る" />
          {/* <input type="submit" value="OK" />
          </form> */}
        </React.Fragment>
      );
    }
  } else {
    //#region エラーメッセージを表示
    if (shopProductParam.is_exception) {
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

    let shopProductParam: ShopProductParam = {
      login: null,
      login_customer_code: "",
      login_customer_name: "",
      is_null_productcode: false,
      is_noexist_productcode: false,
      is_multipleexist_productcode: false,
      is_exception: false,
      product_code: null,
      product_name: "",
      product_price: null,
      product_image: "",
    };

    const req = context.req;
    const res = context.res;

    if (refcomp_result) {
      // ログインチェック
      const login = req.session.get("member_login");
      if (login != void 0) {
        // ログイン済みだったら
        shopProductParam.login = login;
        shopProductParam.login_customer_code = req.session.get("member_code");
        shopProductParam.login_customer_name = req.session.get("menber_name");
        // } else {
        //   // 未ログインだったら
        //   return { props: shopProductParam };
        // }
      }

      //#region GETメッセージからパラメータを取得する
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
      //#endregion GETメッセージからパラメータを取得する

      if (productcode != "") {
        shopProductParam.product_code = productcode;

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
            const product_price =
              product[0].price == "undefined" ? "" : product[0].price;
            const product_image =
              product[0].gazou == "undefined" ? "" : product[0].gazou;
            shopProductParam.product_name = htmlspecialchars(product_name);
            shopProductParam.product_price = htmlspecialchars(product_price);
            shopProductParam.product_image = htmlspecialchars(product_image);
          } else if (product.length < 1) {
            shopProductParam.is_noexist_productcode = true;
          } else {
            shopProductParam.is_multipleexist_productcode = true;
          }
        } catch (e) {
          is_exception = true;
        } finally {
          shopProductParam.is_exception = is_exception;
        }
      } else {
        shopProductParam.is_null_productcode = true;
      }
      //#endregion DBへproductを追加
      return {
        props: shopProductParam,
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

export default ShopProduct;
