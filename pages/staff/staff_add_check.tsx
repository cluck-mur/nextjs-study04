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
  const staff_pass = htmlspecialchars(StaffAddParam.pass);
  const staff_pass2 = htmlspecialchars(StaffAddParam.pass2);
  const router = useRouter();
  
if (staff_name == '' || staff_pass == '' || staff_pass != staff_pass2) {
  if (staff_name == '') {
    // もしスタッフ名が入力されていなかったら "スタッフ名が入力されていません" と表示する
    print "スタッフ名が入力されていません<br />";
} else {
    // もしスタッフ名が入力されていたらスタッフ名を表示する
    print "スタッフ名：$staff_name<br />";
}

if ($staff_pass == '') {
    // もしパスワードが入力されていなかったら "パスワードが入力されていません" と表示する
    print "パスワードが入力されていません<br />";
}

if ($staff_pass != $staff_pass2) {
    // もし１回目のパスワードと2回目のパスワードが一致しなかったら "パスワードが一致しません" と表示する
    print "パスワードが一致しません<br />";
}

    // もし入力に問題があったら "戻る"ボタンだけを表示する
  
    print '<input type="button" onclick="history.back()" value="戻る">';
  print '</form>';

  return (
    <div>
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 スタッフ追加チェック</title>
      </Head>
      <main>
        <form>
          <input type="button" onClick={() => router.back()} value="戻る" />;
        </form>
      </main>
    </div>
  );
  
} else {
    $staff_pass = md5($staff_pass);
    print '<form method="post" action="staff_add_done.php">';
    print '<input type="hidden" name="name" value='.$staff_name.'>';
    print '<input type="hidden" name="pass" value='.$staff_pass.'>';
    print '<br />';
    print '<input type="button" onclick="history.back()" value="戻る">';
    print '<input type="submit" value="OK">';
    print '</form>';
}

  return (
    <div>
      <Head>
        <meta charSet="UTF-8" />
        <title>ろくまる農園 スタッフ追加チェック</title>
      </Head>
    </div>
  );
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
      name: body_json.name,
      pass: body_json.pass,
      pass2: body_json.pass2,
    };
  }
  //#endregion　// POSTメッセージからBodyを取得する

  return {
    props: staff_add_param,
  };
};

export default StaffAddCheck;
