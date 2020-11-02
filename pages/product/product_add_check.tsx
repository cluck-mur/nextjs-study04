/***************************************************
 *
 * 商品追加 入力値チェック 画面
 *
 ***************************************************/
import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import getRawBody from "raw-body";
import formUrlDecoded from "form-urldecoded";
import htmlspecialchars from "htmlspecialchars";
import md5 from "md5";
import {
  msgElementHttpReqError,
  msgElementSystemError,
} from "../../lib/global_const";
import { CompReferer } from "../../lib/myUtils";

type ProductAddCheckParam = {
  is_worng_price: boolean;
  is_exception: boolean;
  name: string | undefined;
  price: string | undefined;
};

const next_page: string = "/product/product_add_done";
const previous_page: string = "/product/product_add";
const redirect_page: string = "/product/product_add";

/**
 * 商品追加 入力値チェック
 * @param productAddCheckParam
 */
const StaffAddCheck = (productAddCheckParam: ProductAddCheckParam) => {
  //#region 前画面からデータを受け取る
  const product_name = productAddCheckParam.name;
  let product_price = productAddCheckParam.price;
  //#endregion 前画面からデータを受け取る

  const items = [];
  items.push(
    <React.Fragment key="head">
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 商品追加チェック</title>
      </Head>
      <h2>商品追加 確認</h2>
    </React.Fragment>
  );

  if (!productAddCheckParam.is_exception) {
    const router = useRouter();

    //#region 画面用データを設定
    let name_str: string = "";

    if (product_name == "") {
      // もし商品名が入力されていなかったら "商品名が入力されていません" と表示する
      name_str = "商品名が入力されていません";
    } else {
      // もし商品名が入力されていたら商品名を表示する
      name_str = `商品名：${product_name}`;
    }
    //#endregion 画面用データを設定

    //#region 次画面へ移行できるか判断する
    let can_move_next_page = true;
    if (
      product_name == "" ||
      product_price == "" ||
      productAddCheckParam.is_worng_price
    ) {
      can_move_next_page = false;
    }
    //#endregion 次画面へ移行できるか判断する

    //#region JSX
    items.push(
      <React.Fragment key="main">
        {/* もし入力に問題があったら "戻る"ボタンだけを表示する */}
        {can_move_next_page ? (
          <React.Fragment key="success">
            以下の商品を追加します。
            <br />
            よろしいですか？
            <br />
            <br />
          </React.Fragment>
        ) : (
          <React.Fragment key="success"></React.Fragment>
        )}
        {/* 商品名表示 */}
        <div>{name_str}</div>
        {/* 不正価格警告文表示 */}
        {productAddCheckParam.is_worng_price && (
          <div>
            価格が正しく入力されていません。
            <br />
          </div>
        )}
        {can_move_next_page ? (
          <React.Fragment>
            <div>価格：{product_price}円</div>
            <form method="post" action={next_page}>
              <input type="hidden" name="name" value={product_name} />
              <input type="hidden" name="price" value={product_price} />
              {/* <br /> */}
              {/* <input type="button" onClick={() => router.back()} value="戻る" /> */}
              <input type="button" onClick={() => history.back()} value="戻る" />
              <input type="submit" value="OK" />
            </form>
          </React.Fragment>
        ) : (
          <form>
            <input type="button" onClick={() => router.back()} value="戻る" />
          </form>
        )}
      </React.Fragment>
    );
    //#endregion JSX
  } else {
    if (productAddCheckParam.is_exception) {
      items.push(msgElementSystemError);
    }
  }

  return <React.Fragment>{items}</React.Fragment>;
};

/**
 * SSR
 * @param context
 */
export const getServerSideProps: GetServerSideProps = async (context) => {
  //#region refererチェック
  const refcomp_result = CompReferer(
    context.req.headers.referer,
    context.req.headers.host,
    previous_page
  );
  //#endregion refererチェック

  if (context.req.method == "POST" && refcomp_result) {
    let productAddCheckParam: ProductAddCheckParam = {
      is_worng_price: false,
      is_exception: false,
      name: "",
      price: "",
    };

    //#region POSTメッセージからパラメータを取得する
    const body = await getRawBody(context.req);
    const body_string = body.toString();
    const body_json = formUrlDecoded(body_string);
    //console.log(body_json)

    const name = typeof body_json.name == "undefined" ? "" : body_json.name;
    const price = typeof body_json.price == "undefined" ? "" : body_json.price;
    //console.log(product_add_param);

    productAddCheckParam.name = htmlspecialchars(name);
    productAddCheckParam.price = htmlspecialchars(price);
    //#endregion POSTメッセージからパラメータを取得する

    //const match_result = productAddCheckParam.price.match(/^[^0-9]+/);
    const match_result = productAddCheckParam.price.match(/^[0-9]+$/);
    //console.log(match_result);
    if (match_result == null) {
      productAddCheckParam.is_worng_price = true;
    }
    return {
      props: productAddCheckParam,
    };
  } else {
    if (context.res) {
      context.res.writeHead(303, { Location: redirect_page });
      context.res.end();
    }

    return { props: {} };
  }
};

export default StaffAddCheck;
