/***************************************************
 *
 * 商品追加画面
 *
 ***************************************************/
import React from "react";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { productNameMaxLegth } from "../../lib/global_const";

/**
 * スタッフ追加
 * @param param0
 */
const ProductAdd = ({}) => {
  const router = useRouter();

  const items = [];
  items.push(
    <React.Fragment key="success">
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 商品追加</title>
      </Head>
      <h2>商品追加</h2>
      ※商品を新たに登録します。
      <br />
      <br />
      <form method="post" action="product_add_check" encType="multipart/from-data">
      {/* <form method="post" action="/product/product_image_upload.html" encType="multipart/from-data"> */}
        商品名を入力してください。
        <br />
        <input
          type="text"
          name="name"
          width="200px"
          maxLength={productNameMaxLegth}
        />
        最大30文字
        <br />
        価格を入力してください。
        <br />
        <input
          type="text"
          name="price"
          width="50px"
          onInput={(e: React.ChangeEvent<HTMLInputElement>) => { e.target.value = e.target.value.replace(/[^0-9]+/i, '') }}
        />円
        <br />
        画像を選んでください。
        <br />
        <input type="file" name="image" width="400px" />
        <br />
        <input type="button" onClick={() => router.back()} value="戻る" />
        <input type="submit" value="OK" />
      </form>
    </React.Fragment>
  );

  return <React.Fragment>{items}</React.Fragment>;
};

/**
 * SSR
 * @param context
 */
export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {},
  };
};

export default ProductAdd;
