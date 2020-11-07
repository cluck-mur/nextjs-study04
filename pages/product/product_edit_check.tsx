/***************************************************
 *
 * 商品修正 入力値チェック 画面
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
import withSession from "../../lib/session";
import { msgYouHaveNotLogin } from "../../lib/global_const";

type ProductEditCheckParam = {
  login: string;
  login_staff_code: string;
  login_staff_name: string;
  is_worng_price: boolean;
  is_exception: boolean;
  code: string | undefined;
  name: string | undefined;
  price: string | undefined;
  image: string | undefined;
};

const next_page: string = "/product/product_edit_done";
const previous_page: string = "/product/product_edit";
const redirect_page: string = "/product/product_edit";

/**
 * 商品修正 入力値チェック
 * @param productEditCheckParam
 */
const ProductEditCheck = (productEditCheckParam: ProductEditCheckParam) => {
  //#region 前画面からデータを受け取る
  const product_code = productEditCheckParam.code;
  const product_name = productEditCheckParam.name;
  let product_price = productEditCheckParam.price;
  const product_image = productEditCheckParam.image;
  //#endregion 前画面からデータを受け取る

  const items = [];
  items.push(
    <React.Fragment key="head">
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 商品修正チェック</title>
      </Head>
      {
        /* ログインしていたら */
        productEditCheckParam.login != void 0 && (
          <React.Fragment>
            {productEditCheckParam.login_staff_name}さん ログイン中
            <br />
          </React.Fragment>
        )
      }
      <h2>商品修正 確認</h2>
    </React.Fragment>
  );

  if (productEditCheckParam.login == void 0) {
    // ログインしていなかったら
    // 未ログインメッセージを表示
    items.push(msgYouHaveNotLogin);
  } else {
    if (!productEditCheckParam.is_exception) {
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
        productEditCheckParam.is_worng_price
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
              以下の商品を修正します。
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
          {productEditCheckParam.is_worng_price && (
            <div>
              価格が正しく入力されていません。
              <br />
            </div>
          )}
          {can_move_next_page ? (
            <React.Fragment>
              <div>価格：{product_price}円</div>
              <div>画像：{product_image}</div>
              <form method="post" action={next_page}>
                <input type="hidden" name="code" value={product_code} />
                <input type="hidden" name="name" value={product_name} />
                <input type="hidden" name="price" value={product_price} />
                <input type="hidden" name="image" value={product_image} />
                {/* <br /> */}
                {/* <input type="button" onClick={() => router.back()} value="戻る" /> */}
                <input
                  type="button"
                  onClick={() => history.back()}
                  value="戻る"
                />
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
      if (productEditCheckParam.is_exception) {
        items.push(msgElementSystemError);
      }
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
    //#region refererチェック
    const refcomp_result = CompReferer(
      context.req.headers.referer,
      context.req.headers.host,
      previous_page
    );
    //#endregion refererチェック

    let productEditCheckParam: ProductEditCheckParam = {
      login: null,
      login_staff_code: "",
      login_staff_name: "",
      is_worng_price: false,
      is_exception: false,
      code: "",
      name: "",
      price: "",
      image: "",
    };

    const req = context.req;
    const res = context.res;

    if (context.req.method == "POST" && refcomp_result) {
      // ログインチェック
      const login = req.session.get("login");
      if (login != void 0) {
        // ログイン済みだったら
        productEditCheckParam.login = login;
        productEditCheckParam.login_staff_code = req.session.get("staff_code");
        productEditCheckParam.login_staff_name = req.session.get("staff_name");
      } else {
        // 未ログインだったら
        return { props: productEditCheckParam };
      }

      //#region POSTメッセージからパラメータを取得する
      const body = await getRawBody(context.req);
      const body_string = body.toString();
      const body_json = formUrlDecoded(body_string);
      //console.log(body_json)

      const code = typeof body_json.code == "undefined" ? "" : body_json.code;
      const name = typeof body_json.name == "undefined" ? "" : body_json.name;
      const price =
        typeof body_json.price == "undefined" ? "" : body_json.price;
      const image =
        typeof body_json.image == "undefined" ? "" : body_json.price;
      //console.log(product_edit_param);

      productEditCheckParam.code = htmlspecialchars(code);
      productEditCheckParam.name = htmlspecialchars(name);
      productEditCheckParam.price = htmlspecialchars(price);
      productEditCheckParam.image = htmlspecialchars(image);
      //#endregion POSTメッセージからパラメータを取得する

      //const match_result = productEditCheckParam.price.match(/^[^0-9]+/);
      const match_result = productEditCheckParam.price.match(/^[0-9]+$/);
      //console.log(match_result);
      if (match_result == null) {
        productEditCheckParam.is_worng_price = true;
      }
      return {
        props: productEditCheckParam,
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

export default ProductEditCheck;
