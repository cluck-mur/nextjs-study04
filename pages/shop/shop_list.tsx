/***************************************************
 *
 * 商品一覧画面（ショップポータル画面）
 *
 ***************************************************/
import React from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import path from "path";
import {
  msgElementHttpReqError,
  msgElementSystemError,
} from "../../lib/global_const";
import withSession from "../../lib/session";
import { msgYouHaveNotLogin } from "../../lib/global_const";
import db from "../../lib/db";
import { SQL } from "sql-template-strings";

type ShopListParam = {
  login: string;
  login_customer_code: string;
  login_customer_name: string;
  is_exception: boolean;
  products: {
    code: number;
    name: string;
    price: number;
  }[];
};

const next_page: string = "/product/product_branch";
// const previous_page: string = "/product/product_list";
// const redirect_page: string = "/product/product_list";

/**
 * スタッフ選択フォームを生成
 * @param ProductListParam
 */
const GenSelectProductFormChildren = (ShopListParam: ShopListParam) => {
  const items = [];
  ShopListParam.products.map((product) => {
    items.push(
      <React.Fragment key={product.code.toString()}>
        <Link href={`shop_product?productcode=${product.code.toString()}`}>
        {/* <Link href={`shop_product/${product.code.toString()}`}> */}
        <a>
            {product.name}({product.price}円)
          </a>
        </Link>
        <br />
      </React.Fragment>
    );
  });
  return <React.Fragment>{items}</React.Fragment>;
};

/**
 * 商品 ポータル
 * @param ShopListParam
 */
const ShopList = (shopListParam: ShopListParam) => {
  const items = [];
  items.push(
    <React.Fragment>
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 商品管理メニュー</title>
      </Head>
      {
        /* ログインしていたら */
        shopListParam.login != void 0 ? (
          <React.Fragment>
            ようこそ {shopListParam.login_customer_name} 様
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
      <h2>商品一覧</h2>
    </React.Fragment>
  );

  if (!shopListParam.is_exception) {
    items.push(
      <React.Fragment>
        {/* <br /> */}
          {GenSelectProductFormChildren(shopListParam)}
        <br />
      </React.Fragment>
    );
  } else {
    //#region エラーメッセージを表示
    items.push(<React.Fragment>{msgElementSystemError}</React.Fragment>);
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
    let shopListParam: ShopListParam = {
      login: null,
      login_customer_code: "",
      login_customer_name: "",
      is_exception: false,
      products: Array(),
    };

    const req = context.req;
    const res = context.res;

    // ログインチェック
    const login = req.session.get("menber_login");
    if (login != void 0) {
      // ログイン済みだったら
      shopListParam.login = login;
      shopListParam.login_customer_code = req.session.get("member_code");
      shopListParam.login_customer_name = req.session.get("member_name");
    // } else {
    //   // 未ログインだったら
    //   return { props: shopListParam };
    // }
    }

    //#region DBへproductを追加
    let is_exception = shopListParam.is_exception;
    try {
      //#region DBアクセス
      const sql = `SELECT code,name,price FROM mst_product WHERE 1`;
      const raw_products: {
        code: number;
        name: string;
        price: number;
      }[] = await db.query(sql);
      //#endregion DBアクセス

      // RowDataPacket型からplain dataに変換
      const products = JSON.parse(JSON.stringify(raw_products));

      products.map((product) => {
        shopListParam.products.push(product);
      });
      //console.log(ProductListParam);
    } catch (e) {
      is_exception = true;
    } finally {
      shopListParam.is_exception = is_exception;
    }
    //#endregion DBへproductを追加

    return {
      props: shopListParam,
    };
  }
);

export default ShopList;
