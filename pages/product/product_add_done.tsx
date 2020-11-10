/***************************************************
 *
 * 商品追加 完了 画面
 *
 ***************************************************/
import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import getRawBody from "raw-body";
import formUrlDecoded from "form-urldecoded";
import htmlspecialchars from "htmlspecialchars";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import {
  dbFilePath,
  dbFileName,
  msgElementHttpReqError,
  msgElementSystemError,
} from "../../lib/global_const";
import { CompReferer } from "../../lib/myUtils";
import withSession from "../../lib/session";
import { msgYouHaveNotLogin } from "../../lib/global_const";

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
      const body = await getRawBody(context.req);
      const body_string = body.toString();
      const body_json = formUrlDecoded(body_string);

      const name = typeof body_json.name == "undefined" ? "" : body_json.name;
      const price =
        typeof body_json.price == "undefined" ? "" : body_json.price;
      const image =
        typeof body_json.image == "undefined" ? "" : body_json.image;
      const image_old =
        typeof body_json.image_old == "undefined" ? "" : body_json.image_old;
      const image_change =
        typeof body_json.imagechange == "undefined"
          ? ""
          : body_json.imagechange;

      const product_name = htmlspecialchars(name);
      const product_price = htmlspecialchars(price);
      const product_image = htmlspecialchars(image);
      //#endregion POSTメッセージからパラメータを取得する

      //#region DBへproductを追加
      // DBファイルのパスを取得
      const dbWorkDirectory = path.join(process.cwd(), dbFilePath);
      const filename: string = dbFileName;
      const fullPath: string = path.join(dbWorkDirectory, filename);

      let is_exception = false;
      try {
        // DBオープン
        const db = await open({
          filename: fullPath,
          driver: sqlite3.Database,
        });
        //db.serialize();
        const sql = `INSERT INTO mst_product(name,price,gazou) VALUES ("${product_name}",${product_price},"${product_image}")`;
        let stmt = await db.prepare(sql);
        try {
          await stmt.run();
        } catch (e) {
          is_exception = true;
        } finally {
          await stmt.finalize();
        }
      } catch (e) {
        is_exception = true;
      } finally {
        // 処理なし
      }
      //#endregion DBへproductを追加

      productAddDoneParam.is_exception = is_exception;
      productAddDoneParam.product_name = product_name;
      productAddDoneParam.product_price = product_price;
      productAddDoneParam.product_image = product_image;
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
