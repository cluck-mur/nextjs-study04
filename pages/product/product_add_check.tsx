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
import withSession from "../../lib/session";
import { msgYouHaveNotLogin } from "../../lib/global_const";
import parse, { Body } from "then-busboy";
import fs from "fs";

type ProductAddCheckParam = {
  login: string;
  login_staff_code: string;
  login_staff_name: string;
  is_worng_price: boolean;
  is_exception: boolean;
  name: string | undefined;
  price: string | undefined;
  image: string | undefined;
};

const next_page: string = "/product/product_add_done";
const previous_page: string = "/product/product_add";
const redirect_page: string = "/product/product_add";

/**
 * 商品追加 入力値チェック
 * @param productAddCheckParam
 */
const ProductAddCheck = (productAddCheckParam: ProductAddCheckParam) => {
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
      {
        /* ログインしていたら */
        productAddCheckParam.login != void 0 && (
          <React.Fragment>
            {productAddCheckParam.login_staff_name}さん ログイン中
            <br />
          </React.Fragment>
        )
      }
      <h2>商品追加 確認</h2>
    </React.Fragment>
  );

  if (productAddCheckParam.login == void 0) {
    // ログインしていなかったら
    // 未ログインメッセージを表示
    items.push(msgYouHaveNotLogin);
  } else {
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
      if (productAddCheckParam.is_exception) {
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

    let productAddCheckParam: ProductAddCheckParam = {
      login: null,
      login_staff_code: "",
      login_staff_name: "",
      is_worng_price: false,
      is_exception: false,
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
        productAddCheckParam.login = login;
        productAddCheckParam.login_staff_code = req.session.get("staff_code");
        productAddCheckParam.login_staff_name = req.session.get("staff_name");
      } else {
        // 未ログインだったら
        return { props: productAddCheckParam };
      }

      //#region POSTメッセージからパラメータを取得する
      const body: Body = await parse(req);
      const body_json = body.json();
      console.log(body_json);

      const name = typeof body_json.name == "undefined" ? "" : body_json.name;
      const price =
        typeof body_json.price == "undefined" ? "" : body_json.price;

      productAddCheckParam.name = htmlspecialchars(name);
      productAddCheckParam.price = htmlspecialchars(price);
      //#endregion POSTメッセージからパラメータを取得する

      // const { files, fields } = await asyncBusboy(req, {
      //   limits: { fileSize: 1000 },
      // });
      /*
      const { files, fields } = await asyncBusboy(req);
      console.log(files);
      console.log(fields);

      const name = typeof fields.name == "undefined" ? "" : fields.name;
      const price = typeof fields.price == "undefined" ? "" : fields.price;

      productAddCheckParam.name = htmlspecialchars(name);
      productAddCheckParam.price = htmlspecialchars(price);
      //#endregion POSTメッセージからパラメータを取得する

      //#region POSTメッセージからファイルを取得する
      if (files != void 0 && files.length > 0) {
        files.map((file) => {
          console.log(file);
          console.log(file.path);
          console.log(file["kFs"].fstat());
        });
      }
      */
      //#endregion POSTメッセージからファイルを取得する

      //const match_result = productAddCheckParam.price.match(/^[^0-9]+/);
      const match_result = productAddCheckParam.price.match(/^[0-9]+$/);
      //console.log(match_result);
      if (match_result == null) {
        productAddCheckParam.is_worng_price = true;
      } else {
        //#region 画像ファイルを/public/uploadにコピーする
        if (
          body_json.image.length == void 0 ||
          (!(body_json.image.length == void 0) && body_json.image.length == 1)
        ) {
          let image_obj = body_json.image;
          if (!(body_json.image.length == void 0)) {
            image_obj = body_json.image[0];
          }
          // POSTメッセージに含まれるjpg/pngファイルが1つの場合のみ処理する
          if (
            (image_obj.mime == "image/jpeg" || image_obj.mime == "image/png") &&
            image_obj.originalFilename != void 0 &&
            image_obj.originalFilename.length > 0
          ) {
            const files = body.fromData();
            //#region ファイルコピー処理
            const rs = body.__strream;
            const ws = fs.createWriteStream(body.image.path, {
              autoClose: true,
            });

            productAddCheckParam.image = image_obj.originalFilename;
            //#endregion ファイルコピー処理
          }
        }
        //#endregion 画像ファイルを/public/uploadにコピーする
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
  }
);

export default ProductAddCheck;
