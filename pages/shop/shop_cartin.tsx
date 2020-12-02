/***************************************************
 *
 * ショップ カートに入れる画面
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

type ShopCartinParam = {
  login: string;
  login_customer_code: string;
  login_customer_name: string;
  is_null_productcode: boolean;
  is_existed_productcode: boolean;
  // is_noexist_productcode: boolean;
  // is_multipleexist_productcode: boolean;
  // is_exception: boolean;
  product_code: string;
  // product_name: string;
  // product_price: string;
  // product_image: string;
};

const next_page: string = "/shop/shop_list";
const previous_page: string = "/shop/shop_list";
const redirect_page: string = "/shop/shop_list";

/**
 * 商品修正
 * @param productDispParam
 */
const ShopCartin = (shopCartinParam: ShopCartinParam) => {
  //#region 前画面からデータを受け取る
  // const product_name = shopCartinParam.product_name;
  // const product_price = shopCartinParam.product_price;
  // const product_image = shopCartinParam.product_image;
  const router = useRouter();
  //#endregion 前画面からデータを受け取る

  const items = [];
  items.push(
    <React.Fragment>
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 カートに追加</title>
      </Head>
      {
        /* ログインしていたら */
        shopCartinParam.login != void 0 ? (
          <React.Fragment>
            ようこそ {shopCartinParam.login_customer_name} 様
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
      <h2>カートに追加</h2>
    </React.Fragment>
  );

  if (shopCartinParam.is_null_productcode) {
    items.push(msgElementProductWasNotSelected);
    items.push(
      <React.Fragment>
        <br />
        <input
          type="button"
          onClick={() => router.push(redirect_page)}
          value="商品一覧へ戻る"
        />
      </React.Fragment>
    );
  } else if (shopCartinParam.is_existed_productcode) {
    items.push(
      <React.Fragment>
        その商品は既にカートに入っています。
        <br />
        <br />
        <input
          type="button"
          onClick={() => router.push(redirect_page)}
          value="商品一覧へ戻る"
        />
      </React.Fragment>
    );
  } else {
    items.push(
      <React.Fragment>
        カートに追加しました。
        <br />
        <br />
        <input
          type="button"
          onClick={() => router.push(redirect_page)}
          value="商品一覧へ戻る"
        />
        {/* <input type="submit" value="OK" />
          </form> */}
      </React.Fragment>
    );
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

    let shopCartinParam: ShopCartinParam = {
      login: null,
      login_customer_code: "",
      login_customer_name: "",
      is_null_productcode: false,
      // is_noexist_productcode: false,
      // is_multipleexist_productcode: false,
      // is_exception: false,
      is_existed_productcode: false,
      product_code: null,
      // product_name: "",
      // product_price: null,
      // product_image: "",
    };

    const req = context.req;
    const res = context.res;

    if (refcomp_result) {
      // ログインチェック
      const login = req.session.get("member_login");
      if (login != void 0) {
        // ログイン済みだったら
        shopCartinParam.login = login;
        shopCartinParam.login_customer_code = req.session.get("member_code");
        shopCartinParam.login_customer_name = req.session.get("menber_name");
        // } else {
        //   // 未ログインだったら
        //   return { props: shopCartinParam };
        // }
      }

      //#region GETメッセージからパラメータを取得する
      //console.log(context.query);
      // const body = await getRawBody(context.req);
      // const body_string = body.toString();
      // const body_json = formUrlDecoded(body_string);
      //console.log(body_json)
      const productcode: string =
        // typeof context.query.productcode == "undefined" ||
        // context.query.productcode == "null"
        typeof context.query.productcode == void 0 ||
        context.query.productcode.length == 0
          ? ""
          : htmlspecialchars(context.query.productcode.toString());
      //console.log(product_add_param);
      //#endregion GETメッセージからパラメータを取得する

      //#region カートに入れる
      if (productcode != "") {
        shopCartinParam.product_code = productcode;

        let cart: { product_code: string; kazu: number }[] = req.session.get(
          "cart"
        );
        if (cart == void 0) {
          cart = new Array();
        }

        // 重複してカートに入らないようにする。
        for (let i = 0; i < cart.length; i++) {
          const product_data = cart[i];
          if (product_data.product_code === productcode) {
            shopCartinParam.is_existed_productcode = true;
            break;
          }
        }

        if (!shopCartinParam.is_existed_productcode) {
          cart.push({ product_code: productcode, kazu: 1 });

          req.session.set("cart", cart);
          await req.session.save();
        }

        // //#region debug
        // console.log("デバッグ情報(shop_cartin.tsx)");
        // cart.map((productcode) => {
        //   console.log(productcode);
        // })
        // //#endregion debug
      } else {
        shopCartinParam.is_null_productcode = true;
      }
      //#endregion カートに入れる

      return {
        props: shopCartinParam,
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

export default ShopCartin;
