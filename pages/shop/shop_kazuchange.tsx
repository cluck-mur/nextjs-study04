/***************************************************
 *
 * ショップ カート商品数量変更 画面
 *
 ***************************************************/
import React from "react";
import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
// import { applySession } from "next-iron-session";
import withSession from "../../lib/session";
import { GetServerSideProps } from "next";
import { CompReferer } from "../../lib/myUtils";
import { myParse, sanitizeFields } from "../../lib/myUtils";
import { useRouter } from "next/router";

const next_page: string = "/shop/shop_cartlook";
const previous_page: string = "/shop/shop_cartlook";
const redirect_page: string = "/shop/shop_cartlook";

type ShopKazuChengeParam = {
  login: string;
  login_customer_code: string;
  login_customer_name: string;
  // is_null_productcode: boolean;
  // is_noexist_productcode: boolean;
  // is_multipleexist_productcode: boolean;
  is_exception: boolean;
  is_worng_price: boolean;
  cart: {
    product_code: string;
    product_name: string;
    product_price: number;
    product_image: string;
    order_num: number;
  }[];
};

/**
 * カート商品数量変更
 */
const ShopKazuChange = (shopKazuChengeParam: ShopKazuChengeParam) => {
  const router = useRouter();

  const items = [];
  items.push(
    <React.Fragment key="head">
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 カート商品数量変更</title>
      </Head>
      <h2>カート商品数量変更</h2>
    </React.Fragment>
  );

  if (shopKazuChengeParam.is_worng_price) {
    items.push(
      <React.Fragment>
        エラー： 数字以外が入力されました。
        <br />
        <br />
        <input
          type="button"
          onClick={() => router.push(previous_page)}
          value="戻る"
        />
      </React.Fragment>
    );
  }
  //   items.push(
  //     <React.Fragment>
  //       カートを空にしました。
  //       {/* <br />
  //       <br />
  //       <Link href="/staff_login/staff_login">ログイン画面へ</Link> */}
  //     </React.Fragment>
  //   );

  return <React.Fragment>{items}</React.Fragment>;
};

/**
 * SSR
 */
export const getServerSideProps: GetServerSideProps = withSession(
  async (context) => {
    //#region refererチェック
    const refcomp_result = CompReferer(
      context.req.headers.referer,
      context.req.headers.host,
      previous_page
    );
    //#endregion refererチェック

    let shopKazuChengeParam: ShopKazuChengeParam = {
      login: null,
      login_customer_code: "",
      login_customer_name: "",
      // is_null_productcode: false,
      // is_noexist_productcode: false,
      // is_multipleexist_productcode: false,
      is_exception: false,
      is_worng_price: false,
      cart: null,
    };

    if (context.req.method == "POST" && refcomp_result) {
      const req = context.req;

      const body = await myParse(req);
      const body_json = body.json();
      const fields_json = sanitizeFields(body);
      //console.log(body_json);

      // ログインチェック
      const login = req.session.get("member_login");
      if (login != void 0) {
        // ログイン済みだったら
        shopKazuChengeParam.login = login;
        shopKazuChengeParam.login_customer_code = req.session.get(
          "member_code"
        );
        shopKazuChengeParam.login_customer_name = req.session.get(
          "menber_name"
        );
        // } else {
        //   // 未ログインだったら
        //   return { props: shopCartlookParam };
        // }
      }

      //#region カートの数量を変更
      // let cart: { product_code: string; kazu: number }[] = req.session.get(
      //   "cart"
      // );
      let cart = req.session.get(
        "cart"
      );
      if (cart != void 0) {
        for (let i = 0; i < cart.length; i++) {
          const order = cart[i];
          const productcode = order.product_code;
          let order_num = order.kazu;

          const new_order_num = fields_json[productcode];

          const match_result = new_order_num.match(/^[0-9]+$/);
          order_num = parseInt(new_order_num);

          if (
            match_result == null ||
            isNaN(order_num) ||
            order_num == void 0 ||
            order_num <= 0
          ) {
            shopKazuChengeParam.is_worng_price = true;
            break;
          } else {
            order.kazu = order_num;
          }
        }
      }

      if (shopKazuChengeParam.is_worng_price != true) {
        req.session.set("cart", cart);
        await req.session.save();
        //#endregion カートの数量を変更

        //#region 次のページへ
        if (context.res) {
          context.res.writeHead(303, { Location: next_page });
          context.res.end();
        }
        //#endregion 次のページへ
      }

      return {
        props: shopKazuChengeParam,
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

export default ShopKazuChange;
