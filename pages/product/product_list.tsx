/***************************************************
 *
 * 商品 ポータル画面
 *
 ***************************************************/
import React from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import {
  dbFilePath,
  dbFileName,
  msgElementHttpReqError,
  msgElementSystemError,
} from "../../lib/global_const";

type ProductListParam = {
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
const GenSelectProductFormChildren = (ProductListParam: ProductListParam) => {
  const items = [];
  ProductListParam.products.map((product) => {
    items.push(
      <React.Fragment key={product.code.toString()} >
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
    </React.Fragment>
  );

  if (!productListParam.is_exception) {
    items.push(
      <React.Fragment>
        <h2>商品管理 メニュー</h2>
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
        <Link href="/staff_login/staff_top"><a>ショップ管理トップメニューへ</a></Link>
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
export const getServerSideProps: GetServerSideProps = async (context) => {
  //#region DBへproductを追加
  // DBファイルのパスを取得
  const dbWorkDirectory = path.join(process.cwd(), dbFilePath);
  const filename: string = dbFileName;
  const fullPath: string = path.join(dbWorkDirectory, filename);

  let is_exception = false;
  let productListParam: ProductListParam = {
    is_exception: is_exception,
    products: Array(),
  };
  try {
    // DBオープン
    const db = await open({
      filename: fullPath,
      driver: sqlite3.Database,
    });
    //db.serialize();

    const products = await db.all("SELECT code,name,price FROM mst_product WHERE 1");
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
};

export default ProductList;
