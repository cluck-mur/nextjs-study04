/***************************************************
 *
 * スタッフ追加 入力値チェック 画面
 *
 ***************************************************/
import Head from "next/head";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import getRawBody from "raw-body";
import formUrlDecoded from "form-urldecoded";
import htmlspecialchars from "htmlspecialchars"
import md5 from "md5";

type StaffAddParam = {
  name: string;
  pass: string;
  pass2: string;
};

/**
 * スタッフ追加 入力値チェック
 * @param param0
 */
const StaffAddCheck = (StaffAddParam) => {
  // 前画面からデータを受け取る
  const staff_name = htmlspecialchars(StaffAddParam.name);
  let staff_pass = htmlspecialchars(StaffAddParam.pass);
  const staff_pass2 = htmlspecialchars(StaffAddParam.pass2);
  const router = useRouter();

  let name_str: string = '';
  let pass_display_flg: boolean = false;
  let pass2_display_flg: boolean = false;

  if (staff_name == '') {
    // もしスタッフ名が入力されていなかったら "スタッフ名が入力されていません" と表示する
    name_str = 'スタッフ名が入力されていません';
  } else {
    // もしスタッフ名が入力されていたらスタッフ名を表示する
    name_str = `スタッフ名：${staff_name}`;
  }

  if (staff_pass == '') {
    // もしパスワードが入力されていなかったら "パスワードが入力されていません" と表示する
    pass_display_flg = true;
  }

  if (staff_pass != staff_pass2) {
    // もし１回目のパスワードと2回目のパスワードが一致しなかったら "パスワードが一致しません" と表示する
    pass2_display_flg = true;
  }

  if (staff_name == '' || staff_pass == '' || staff_pass != staff_pass2) {
    return (
      <div>
        <Head>
          <meta charSet="UTF-8" />
          <title>ろくまる農園 スタッフ追加チェック</title>
        </Head>
        {/* もし入力に問題があったら "戻る"ボタンだけを表示する */}
        <main>
          {/* スタッフ名表示 */}
          <div style={{ display: null }}>{name_str}<br /></div>
          {/* パスワード未入力警告文表示 */}
          <div style={{ display: pass_display_flg ? null : 'none' }}>パスワードが入力されていません<br /></div>
          {/* パスワード不一致警告文表示 */}
          <div style={{ display: pass2_display_flg ? null : 'none' }}>パスワードが一致しません<br /></div>
          <form>
            <input type="button" onClick={() => router.back()} value="戻る" />;
        </form>
        </main>
      </div>
    );

  } else {
    staff_pass = md5(staff_pass);

    return (
      <div>
        <Head>
          <meta charSet="UTF-8" />
          <title>ろくまる農園 スタッフ追加チェック</title>
        </Head>
        {/* もし入力に問題があったら "戻る"ボタンだけを表示する */}
        <main>
          <div style={{ display: 'block' }}>{name_str}<br /></div>
          <form method="post" action="staff_add_done">
            <input type="hidden" name="name" value={staff_name} />
            <input type="hidden" name="pass" value={staff_pass} />
            <br />
            <input type="button" onClick={() => router.back()} value="戻る" />
            <input type="submit" value="OK" />
          </form>
        </main>
      </div>
    );
  }

};

/**
 * SSR
 * @param context
 */
export const getServerSideProps: GetServerSideProps = async (context) => {
  let staff_add_param: StaffAddParam;

  //#region // POSTメッセージからBodyを取得する
  if (context.req.method == "POST") {
    const body = await getRawBody(context.req);
    const body_string = body.toString();
    const body_json = formUrlDecoded(body_string);
    //console.log(body_json)
    staff_add_param = {
      name: typeof body_json.name == undefined ? '' : body_json.name,
      pass: typeof body_json.pass == undefined ? '' : body_json.pass,
      pass2: typeof body_json.pass2 == undefined ? '' : body_json.pass2
    };
    console.log(staff_add_param);
  }
  //#endregion　// POSTメッセージからBodyを取得する

  return {
    props: staff_add_param,
  };
};

export default StaffAddCheck;
