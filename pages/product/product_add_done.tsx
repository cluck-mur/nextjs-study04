/***************************************************
 *
 * 商品追加 完了 画面
 *
 ***************************************************/
import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import htmlspecialchars from "htmlspecialchars";
import path from "path";
import {
  msgElementHttpReqError,
  msgElementSystemError,
} from "../../lib/global_const";
import { CompReferer } from "../../lib/myUtils";
import { myParse, sanitizeFields } from "../../lib/myUtils";
import withSession from "../../lib/session";
import { msgYouHaveNotLogin } from "../../lib/global_const";
import db from "../../lib/db";
import { SQL } from "sql-template-strings";

type ProductAddDoneParam = {
  login: string;
  login_staff_code: string;
  login_staff_name: string;
  is_exception: boolean;
  product_name: string;
  product_price: string;
  product_image: string;
};

const previous_page: string = "/product/product_add_check";
const redirect_page: string = "/product/product_add";
const return_page: string = "/product/product_list";

/**
 * 商品追加 完了
 * @param productAddDoneParam
 */
const ProductAddDone = (productAddDoneParam: ProductAddDoneParam) => {
  const router = useRouter();

  const items = [];
  items.push(
    <React.Fragment key="head">
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 商品追加 完了</title>
      </Head>
      {
        /* ログインしていたら */
        productAddDoneParam.login != void 0 && (
          <React.Fragment>
            {productAddDoneParam.login_staff_name}さん ログイン中
            <br />
          </React.Fragment>
        )
      }
      <h2>商品追加 完了</h2>
    </React.Fragment>
  );

  if (productAddDoneParam.login == void 0) {
    // ログインしていなかったら
    // 未ログインメッセージを表示
    items.push(msgYouHaveNotLogin);
  } else {
    if (!productAddDoneParam.is_exception) {
      items.push(
        <React.Fragment key="success">
          {productAddDoneParam.product_name} を追加しました。
          <br />
          <br />
          <input
            type="button"
            onClick={() => {
              router.push(return_page);
            }}
            value="商品管理ポータルへ"
          />
        </React.Fragment>
      );
    } else {
      //#region エラーメッセージを表示
      if (productAddDoneParam.is_exception) {
        items.push(msgElementSystemError);
      }
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
    //#region refererチェック
    const refcomp_result = CompReferer(
      context.req.headers.referer,
      context.req.headers.host,
      previous_page
    );
    //#endregion refererチェック

    let productAddDoneParam: ProductAddDoneParam = {
      login: null,
      login_staff_code: "",
      login_staff_name: "",
      is_exception: false,
      product_name: "",
      product_price: "",
      product_image: "",
    };

    const req = context.req;
    const res = context.res;

    if (context.req.method == "POST" && refcomp_result) {
      // ログインチェック
      const login = req.session.get("login");
      if (login != void 0) {
        // ログイン済みだったら
        productAddDoneParam.login = login;
        productAddDoneParam.login_staff_code = req.session.get("staff_code");
        productAddDoneParam.login_staff_name = req.session.get("staff_name");
      } else {
        // 未ログインだったら
        return { props: productAddDoneParam };
      }

      //#region POSTメッセージからパラメータを取得する
      const body = await myParse(req);
      const body_json = body.json();
      const fields_json = sanitizeFields(body);

      productAddDoneParam.product_name =
        typeof fields_json.name == "undefined" ? "" : fields_json.name;
      productAddDoneParam.product_price =
        typeof fields_json.price == "undefined" ? "" : fields_json.price;
      productAddDoneParam.product_image =
        typeof fields_json.image == "undefined" ? "" : fields_json.image;
      const image_old =
        typeof fields_json.image_old == "undefined"
          ? ""
          : fields_json.image_old;
      const image_change =
        typeof fields_json.imagechange == "undefined"
          ? ""
          : fields_json.imagechange;

      const product_name = productAddDoneParam.product_name;
      const product_price = productAddDoneParam.product_price;
      const product_image = productAddDoneParam.product_image;
      //#endregion POSTメッセージからパラメータを取得する

      //#region DBへproductを追加
      let is_exception = false;
      try {
          //#region DBアクセス
          const sql = `INSERT INTO mst_product(name,price,gazou) VALUES ("${product_name}",${product_price},"${product_image}")`;
          const result = await db.query(sql);
          //#endregion DBアクセス
        
        if (result.error != void 0) {
          is_exception = true;
        }
      } catch (e) {
        is_exception = true;
      } finally {
        // 処理なし
      }
      //#endregion DBへproductを追加

      productAddDoneParam.is_exception = is_exception;
      //console.log(product_add_param);

      return {
        props: productAddDoneParam,
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

export default ProductAddDone;
