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
import withSession from "../../lib/session";
import { msgYouHaveNotLogin } from "../../lib/global_const";

type ProductAddParam = {
  login: string;
  login_staff_code: string;
  login_staff_name: string;
};

/**
 * スタッフ追加
 * @param param0
 */
const ProductAdd = (productAddParam: ProductAddParam) => {
  const router = useRouter();

  const items = [];
  items.push(
    <React.Fragment key="head">
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 商品追加</title>
      </Head>
      {
        /* ログインしていたら */
        productAddParam.login != void 0 && (
          <React.Fragment>
            {productAddParam.login_staff_name}さん ログイン中
            <br />
          </React.Fragment>
        )
      }
      <h2>商品追加</h2>
    </React.Fragment>
  );

  if (productAddParam.login == void 0) {
    // ログインしていなかったら
    // 未ログインメッセージを表示
    items.push(msgYouHaveNotLogin);
  } else {
    items.push(
      <React.Fragment key="main">
        ※商品を新たに登録します。
        <br />
        <br />
        {/* <form method="post" action="product_add_check" encType="multipart/form-data"> */}
        <form method="post" action="product_add_check">
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
            onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
              e.target.value = e.target.value.replace(/[^0-9]+/i, "");
            }}
          />
          円
          <br />
          画像を選んでください。
          <br />
          <input type="file" name="image" width="400px" />
          <br />
          <br />
          <input type="button" onClick={() => router.back()} value="戻る" />
          <input type="submit" value="OK" />
        </form>
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
    let productAddParam: ProductAddParam = {
      login: null,
      login_staff_code: "",
      login_staff_name: "",
    };

    const req = context.req;
    const res = context.res;

    // ログインチェック
    const login = req.session.get("login");
    if (login != void 0) {
      // ログイン済みだったら
      productAddParam.login = login;
      productAddParam.login_staff_code = req.session.get("staff_code");
      productAddParam.login_staff_name = req.session.get("staff_name");
    }

    return {
      props: productAddParam,
    };
  }
);

export default ProductAdd;
