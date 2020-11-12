/***************************************************
 *
 * 商品修正 入力値チェック 画面
 *
 ***************************************************/
import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import htmlspecialchars from "htmlspecialchars";
import md5 from "md5";
import {
  msgElementHttpReqError,
  msgElementSystemError,
} from "../../lib/global_const";
import { CompReferer, transferImageFile } from "../../lib/myUtils";
import { myParse, sanitizeFields } from "../../lib/myUtils";
import withSession from "../../lib/session";
import {
  msgYouHaveNotLogin,
  //uploadFilePath
  publicFolder,
  publicRelativeFolder,
} from "../../lib/global_const";
import parse, { Body } from "then-busboy";
import fs, { ReadStream, WriteStream } from "fs";
import path from "path";
import getConfig from "next/config";

type ProductEditCheckParam = {
  login: string;
  login_staff_code: string;
  login_staff_name: string;
  is_worng_price: boolean;
  is_wrong_image_type: boolean;
  // is_multi_mages: boolean;
  is_toobig_image: boolean;
  is_exception: boolean;
  code: string | undefined;
  name: string | undefined;
  price: string | undefined;
  image: string | undefined;
  image_old: string | undefined;
  image_change: string | undefined;
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
  let product_image = productEditCheckParam.image;
  const product_image_old = productEditCheckParam.image_old;
  const product_image_change = productEditCheckParam.image_change;
  if (product_image_change == "no") {
    product_image = product_image_old;
  }
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
        name_str = `${product_name}`;
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
          <b>商品コード</b>
          <br />
          {product_code}
          <br />
          {/* 商品名表示 */}
          <b>商品名</b>
          <br />
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
              <b>価格</b>
              <br />
              {product_price}円
              <br />
              <b>画像</b>
              <br />
              {product_image == void 0 || product_image == "" ? (
                <img src="/now_printing.png" />
              ) : (
                <p style={{ width: "150px", height: "150px" }}>
                  <img width="100%" src={"/upload/" + product_image} />
                </p>
              )}
              <form method="post" action={next_page}>
                <input type="hidden" name="code" value={product_code} />
                <input type="hidden" name="name" value={product_name} />
                <input type="hidden" name="price" value={product_price} />
                <input type="hidden" name="image" value={product_image} />
                <input
                  type="hidden"
                  name="image_old"
                  value={product_image_old}
                />
                <input
                  type="hidden"
                  name="imagechange"
                  value={product_image_change}
                />
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
      is_wrong_image_type: false,
      // is_multi_mages: false,
      is_toobig_image: false,
      is_exception: false,
      code: "",
      name: "",
      price: "",
      image: "",
      image_old: "",
      image_change: "",
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
      const body = await myParse(req);
      const body_json = body.json();
      const fields_json = sanitizeFields(body);
      //console.log(body_json);

      productEditCheckParam.code =
        typeof fields_json.code == void 0 || fields_json.code == 0
          ? ""
          : fields_json.code;
      productEditCheckParam.name =
        typeof fields_json.name == void 0 || fields_json.name == 0
          ? ""
          : fields_json.name;
      productEditCheckParam.price =
        typeof fields_json.price == void 0 || fields_json.price == 0
          ? ""
          : fields_json.price;
      // const image =
      //   typeof body_json.image == void 0 || body_json.image == 0
      //     ? ""
      //     : body_json.image;
      productEditCheckParam.image_old =
        typeof fields_json.image_old == void 0 || fields_json.image_old == 0
          ? ""
          : fields_json.image_old;
      productEditCheckParam.image_change =
        typeof fields_json.imagechange == void 0 || fields_json.imagechange == 0
          ? "no"
          : fields_json.imagechange;
      //console.log(product_edit_param);

      // productEditCheckParam.code = htmlspecialchars(code);
      // productEditCheckParam.name = htmlspecialchars(name);
      // productEditCheckParam.price = htmlspecialchars(price);
      // productEditCheckParam.image_old = htmlspecialchars(image_old);
      // productEditCheckParam.image_change = htmlspecialchars(image_change);
      //#endregion POSTメッセージからパラメータを取得する

      //const match_result = productEditCheckParam.price.match(/^[^0-9]+/);
      const match_result = productEditCheckParam.price.match(/^[0-9]+$/);
      const price_int = parseInt(productEditCheckParam.price, 10);
      //console.log(match_result);
      if (
        match_result == null ||
        isNaN(price_int) ||
        price_int == void 0 ||
        price_int <= 0
      ) {
        productEditCheckParam.is_worng_price = true;
      } else {
        //#region 画像ファイルを/public/uploadにコピーする
        if (productEditCheckParam.image_change == "yes") {
          if (
            body_json.image.originalFilename != void 0 &&
            body_json.image.originalFilename.length > 0
          ) {
            // イメージが添付されてる場合
            // if (
            //   !(body_json.image.length == void 0) &&
            //   body_json.image.length == 1
            // ) {
            let image_obj = body_json.image;
            // if (!(body_json.image.length == void 0)) {
            //   image_obj = body_json.image[0];
            // }
            // POSTメッセージに含まれるjpg/pngファイルが1つの場合のみ処理する
            if (
              image_obj.mime == "image/jpeg" ||
              image_obj.mime == "image/png"
            ) {
              const rimage_stat = fs.statSync(body_json.image.path);
              if (rimage_stat.size > 1048576) {
                // ファイルサイズが大きすぎる
                productEditCheckParam.is_toobig_image = true;
              } else {
                //#region ファイルコピー処理
                // uploadファイルのパスを取得
                // const dbWorkDirectory = path.join(
                //   process.cwd(),
                //   uploadFilePath
                // );
                // const filename: string = image_obj.originalFilename;
                // const fullPath: string = path.join(dbWorkDirectory, filename);
                const { serverRuntimeConfig } = getConfig();
                const filename: string = image_obj.originalFilename;
                // const fullPath = path.join(
                //   serverRuntimeConfig.PROJECT_ROOT,
                //   publicFolder,
                //   publicRelativeFolder,
                //   `./${filename}`
                // );
                const fullPath = path.resolve(
                  publicFolder,
                  publicRelativeFolder,
                  filename
                );

                let rs: ReadStream = null;
                let ws: WriteStream = null;
                try {
                  rs = fs.createReadStream(body_json.image.path, {
                    autoClose: true,
                  });
                  ws = fs.createWriteStream(fullPath, {
                    autoClose: true,
                    flags: "w",
                  });

                  // ファイルコピー
                  await transferImageFile(rs, ws);

                  productEditCheckParam.image = image_obj.originalFilename;
                  //#endregion ファイルコピー処理
                } catch (e) {
                  throw e;
                } finally {
                  rs.close();
                  ws.close();
                }
              }
            } else {
              // イメージタイプがエラー
              productEditCheckParam.is_wrong_image_type = true;
            }
            // } else {
            //   // 複数のイメージファイルが添付されている。
            //   productAddCheckParam.is_multi_mages = true;
            // }
          }
        }
        //#endregion 画像ファイルを/public/uploadにコピーする
      }
      //#region テンポラリファイル削除
      // if (
      //   body_json.image.path != void 0 &&
      //   body_json.image.path.length > 0
      // ) {
      //   if (fs.existsSync(body_json.image.path)) {
      //     fs.unlinkSync(body_json.image.path);
      //   }
      // }
      //#endregion テンポラリファイル削除

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
