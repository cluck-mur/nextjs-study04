/***************************************************
 *
 * 商品 ポータル画面
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

type ProductListParam = {
  login: string;
  login_staff_code: string;
  login_staff_name: string;
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
 * 商品選択フォームを生成
 * @param ProductListParam
 */
const GenSelectProductFormChildren = (ProductListParam: ProductListParam) => {
  const items = [];
  ProductListParam.products.map((product) => {
    items.push(
      <React.Fragment key={product.code.toString()}>
        <input type="radio" name="productcode" value={product.code} />
        {product.code}: {product.name} ({product.price}円)
        <br />
      </React.Fragment>
    );
  });
  return <React.Fragment>{items}</React.Fragment>;
};

/**
 * 商品 ポータル
 * @param ProductListParam
 */
const ProductList = (productListParam: ProductListParam) => {
  const items = [];
  items.push(
    <React.Fragment>
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 商品管理メニュー</title>
      </Head>
      {
        /* ログインしていたら */
        productListParam.login != void 0 && (
          <React.Fragment>
            {productListParam.login_staff_name}さん ログイン中
            <br />
          </React.Fragment>
        )
      }
      <h2>商品管理 メニュー</h2>
    </React.Fragment>
  );

  if (productListParam.login == void 0) {
    // ログインしていなかったら
    // 未ログインメッセージを表示
    items.push(msgYouHaveNotLogin);
  } else {
    if (!productListParam.is_exception) {
      items.push(
        <React.Fragment>
          <br />
          {/* 分岐画面へ移行する */}
          {/*
        <form method="post" action="product_branch">
        */}
          <form method="post" action={next_page}>
            <b>新規商品 追加</b>
            <br />
            <input
              key="add"
              type="submit"
              name="add"
              value="追加"
              style={{ width: 128 }}
            />
            <br />
            <br />
            <br />
            <b>既存商品 参照・修正・削除</b>
            <br />
            ※商品を選択し、操作したいボタンを押してください。
            <br />
            <br />
            {GenSelectProductFormChildren(productListParam)}
            <input key="disp" type="submit" name="disp" value="参照" />
            <input key="edit" type="submit" name="edit" value="修正" />
            <input key="delete" type="submit" name="delete" value="削除" />
          </form>
          <br />
          <Link href="/staff_login/staff_top">
            <a>ショップ管理トップメニューへ</a>
          </Link>
        </React.Fragment>
      );
    } else {
      //#region エラーメッセージを表示
      items.push(<React.Fragment>{msgElementSystemError}</React.Fragment>);
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
    let productListParam: ProductListParam = {
      login: null,
      login_staff_code: "",
      login_staff_name: "",
      is_exception: false,
      products: Array(),
    };

    const req = context.req;
    const res = context.res;

    // ログインチェック
    const login = req.session.get("login");
    if (login != void 0) {
      // ログイン済みだったら
      productListParam.login = login;
      productListParam.login_staff_code = req.session.get("staff_code");
      productListParam.login_staff_name = req.session.get("staff_name");
    } else {
      // 未ログインだったら
      return { props: productListParam };
    }

    //#region DBへproductを追加
    let is_exception = productListParam.is_exception;
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
        productListParam.products.push(product);
      });
      //console.log(ProductListParam);
    } catch (e) {
      is_exception = true;
    } finally {
      productListParam.is_exception = is_exception;
    }
    //#endregion DBへproductを追加

    return {
      props: productListParam,
    };
  }
);

export default ProductList;
