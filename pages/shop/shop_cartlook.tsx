/***************************************************
 *
 * ショップ カートを見る画面
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

type ShopCartlookParam = {
  login: string;
  login_customer_code: string;
  login_customer_name: string;
  // is_null_productcode: boolean;
  // is_noexist_productcode: boolean;
  // is_multipleexist_productcode: boolean;
  is_exception: boolean;
  cart: {
    product_code: string;
    product_name: string;
    product_price: number;
    product_image: string;
    order_num: number;
  }[];
};

const next_page: string = "/shop/shop_list";
const previous_page: string = "/shop/shop_list";
const redirect_page: string = "/shop/shop_list";

/**
 * 商品修正
 * @param shopCartlookParam
 */
const ShopCartlook = (shopCartlookParam: ShopCartlookParam) => {
  //#region 前画面からデータを受け取る
  // const product_name = shopCartlookParam.product_name;
  // const product_price = shopCartlookParam.product_price;
  // const product_image = shopCartlookParam.product_image;
  const router = useRouter();
  //#endregion 前画面からデータを受け取る

  const items = [];
  items.push(
    <React.Fragment>
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 カート情報</title>
      </Head>
      {
        /* ログインしていたら */
        shopCartlookParam.login != void 0 ? (
          <React.Fragment>
            ようこそ {shopCartlookParam.login_customer_name} 様
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
      <h2>カート情報</h2>
    </React.Fragment>
  );

  if (!shopCartlookParam.is_exception) {
    if (shopCartlookParam.cart != void 0) {
      items.push(
        <React.Fragment>
          <form method="post" action="shop_kazuchange">
            {(() => {
              let sub_items = [];
              shopCartlookParam.cart.map((product_data) => {
                sub_items.push(
                  <React.Fragment>
                    {/* <b>商品コード</b> */}
                    {product_data.product_code}:{/* <b>商品名</b> */}
                    {product_data.product_name}
                    {/* <b>画像</b> */}
                    {product_data.product_image == void 0 ||
                    product_data.product_image == "" ? (
                      <img src="/now_printing.png" />
                    ) : (
                      // <div style={{ width: "150px", height: "150px" }}>
                      <img
                        width="100%"
                        style={{ width: "150px", height: "150px" }}
                        src={`${imageServer1stPath}${
                          product_data.product_image
                        }?path=${encodeURIComponent(
                          "/upload/" + product_data.product_image
                        )}`}
                      />
                      // </div>
                    )}
                    {/* <b>価格</b> */}
                    {product_data.product_price}円 (数量
                    <input
                      type="text"
                      name={"change" + product_data.product_code}
                      defaultValue={product_data.order_num}
                    ></input>
                    ){product_data.product_price * product_data.order_num}円
                    <input
                      type="checkbox"
                      name={"delete" + product_data.product_code}
                    ></input>
                    <br />
                    <br />
                  </React.Fragment>
                );
              });
              return sub_items;
            })()}
            <input type="submit" value="数量変更"></input>
          </form>
        </React.Fragment>
      );
    } else {
      items.push(
        <React.Fragment>
          カートに商品が入っていません。
          <br />
          <br />
        </React.Fragment>
      );
    }
    items.push(
      <React.Fragment>
        {/* <input
          type="button"
          onClick={() =>
            router.push(
              `shop_cartin?productcode=${shopCartlookParam.product_code}`
            )
          }
          value="カートに入れる"
        /> */}
        <input
          type="button"
          onClick={() => router.push(previous_page)}
          value="商品一覧へ戻る"
        />
        {/* <input type="submit" value="OK" />
          </form> */}
      </React.Fragment>
    );
  } else {
    //#region エラーメッセージを表示
    if (shopCartlookParam.is_exception) {
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

    let shopCartlookParam: ShopCartlookParam = {
      login: null,
      login_customer_code: "",
      login_customer_name: "",
      // is_null_productcode: false,
      // is_noexist_productcode: false,
      // is_multipleexist_productcode: false,
      is_exception: false,
      cart: null,
    };

    const req = context.req;
    const res = context.res;

    if (refcomp_result) {
      // ログインチェック
      const login = req.session.get("member_login");
      if (login != void 0) {
        // ログイン済みだったら
        shopCartlookParam.login = login;
        shopCartlookParam.login_customer_code = req.session.get("member_code");
        shopCartlookParam.login_customer_name = req.session.get("menber_name");
        // } else {
        //   // 未ログインだったら
        //   return { props: shopCartlookParam };
        // }
      }

      //#region sessionからカートの中身を取得
      let cart: { product_code: string; kazu: number }[] = req.session.get(
        "cart"
      );
      if (cart != void 0) {
        for (let i = 0; i < cart.length; i++) {
          const order = cart[i];
          const productcode = order.product_code;
          const order_num = order.kazu;

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
            if (raw_product.length > 0) {
              if (shopCartlookParam.cart == void 0) {
                shopCartlookParam.cart = new Array();
              }
              shopCartlookParam.cart.push({
                product_code: productcode,
                product_name: raw_product[0].name,
                product_price: raw_product[0].price,
                product_image: raw_product[0].gazou,
                order_num: order_num,
              });
            }
          } catch (e) {
            is_exception = true;
          } finally {
            shopCartlookParam.is_exception = is_exception;
          }
          if (is_exception == true) {
            break;
          }
        }
      }
      //#endregion sessionからカートの中身を取得

      return {
        props: shopCartlookParam,
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

export default ShopCartlook;
