/***************************************************
 *
 * 商品削除 完了 画面
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
import fs from "fs";
import { msgYouHaveNotLogin, uploadFilePath } from "../../lib/global_const";

type ProductDeleteDoneParam = {
  is_exception: boolean;
  login: string;
  login_staff_code: string;
  login_staff_name: string;
  product_code: string;
  product_name: string;
};

//const next_page: string = "/product/product_edit_check";
const previous_page: string = "/product/product_delete";
const redirect_page: string = "/product/product_list";
const return_page: string = "/product/product_list";

/**
 * 商品削除 完了
 * @param productDeleteDoneParam
 */
const ProductDeleteDone = (productDeleteDoneParam: ProductDeleteDoneParam) => {
  const router = useRouter();

  const items = [];
  items.push(
    <React.Fragment>
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 商品削除 完了</title>
      </Head>
      {
        /* ログインしていたら */
        productDeleteDoneParam.login != void 0 && (
          <React.Fragment>
            {productDeleteDoneParam.login_staff_name}さん ログイン中
            <br />
          </React.Fragment>
        )
      }
      <h2>商品削除 完了</h2>
    </React.Fragment>
  );

  if (productDeleteDoneParam.login == void 0) {
    // ログインしていなかったら
    // 未ログインメッセージを表示
    items.push(msgYouHaveNotLogin);
  } else {
    if (!productDeleteDoneParam.is_exception) {
      items.push(
        <React.Fragment>
          {productDeleteDoneParam.product_name} を削除しました。
          <br />
          <br />
          <input
            type="button"
            onClick={() => {
              router.push(return_page);
            }}
            value="商品ポータルへ"
          />
        </React.Fragment>
      );
    } else {
      //#region エラーメッセージを表示
      if (productDeleteDoneParam.is_exception) {
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

    let productDeleteDoneParam: ProductDeleteDoneParam = {
      login: null,
      login_staff_code: "",
      login_staff_name: "",
      is_exception: false,
      product_code: "",
      product_name: "",
    };

    const req = context.req;
    const res = context.res;

    //#region POSTメッセージからパラメータを取得する
    if (context.req.method == "POST" && refcomp_result) {
      // ログインチェック
      const login = req.session.get("login");
      if (login != void 0) {
        // ログイン済みだったら
        productDeleteDoneParam.login = login;
        productDeleteDoneParam.login_staff_code = req.session.get("staff_code");
        productDeleteDoneParam.login_staff_name = req.session.get("staff_name");
      } else {
        // 未ログインだったら
        return { props: productDeleteDoneParam };
      }

      const body = await getRawBody(context.req);
      const body_string = body.toString();
      const body_json = formUrlDecoded(body_string);

      //#region 前画面からデータを受け取る
      const code = typeof body_json.code == "undefined" ? "" : body_json.code;
      const name = typeof body_json.name == "undefined" ? "" : body_json.name;
      const image =
        typeof body_json.image == "undefined" ? "" : body_json.image;

      const product_code = htmlspecialchars(code);
      const product_name = htmlspecialchars(name);
      const product_image = htmlspecialchars(image);
      //#endregion 前画面からデータを受け取る

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
        const sql = `DELETE FROM mst_product WHERE code=${product_code}`;
        let stmt = await db.prepare(sql);
        try {
          await stmt.run();
        } catch (e) {
          is_exception = true;
        } finally {
          await stmt.finalize();
        }

        if (typeof product_image != void 0 && product_image.length > 0) {
          const product: {
            code: number;
          }[] = await db.all(
            // `SELECT code FROM mst_product WHERE gazou="${product_image_old}" AND code!=${product_code}`
            `SELECT code FROM mst_product WHERE gazou="${product_image}"`
          );
          if (!(product.length > 0)) {
            // ファイルを消去する
            // uploadファイルのパスを取得
            const dbWorkDirectory = path.join(process.cwd(), uploadFilePath);
            const filename: string = product_image;
            const fullPath: string = path.join(dbWorkDirectory, filename);
            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath);
            }
          }
        }
      } catch (e) {
        is_exception = true;
      } finally {
        // 処理なし
      }
      //#endregion DBへproductを追加

      productDeleteDoneParam.is_exception = is_exception;
      productDeleteDoneParam.product_code = product_code;
      productDeleteDoneParam.product_name = product_name;
      //console.log(product_add_param);

      return {
        props: productDeleteDoneParam,
      };
    } else {
      if (context.res) {
        context.res.writeHead(303, { Location: redirect_page });
        context.res.end();
      }

      return { props: {} };
    }
    //#endregion POSTメッセージからパラメータを取得する
  }
);

export default ProductDeleteDone;
