/***************************************************
 * 
 * スタッフ追加画面
 * 
 ***************************************************/
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'

/**
 * スタッフ追加
 * @param param0 
 */
const StaffAdd = ({ }) => {
  const router = useRouter()

  return <div>
    スタッフ追加<br />
    <br />
    <form method="post" action="staff_add_check">
      スタッフ名を入力してください。<br />
      <input type="text" name="name" width="200px" /><br />
      パスワードを入力してください。<br />
      <input type="password" name="pass" width="100px" /><br />
      パスワードをもう一度入力してください。<br />
      <input type="password" name="pass2" width="100px" /><br />
      <br />
      <input type="button" onClick={() => router.back()} value="戻る" />
      <input type="submit" value="OK" />
  </form>
  </div>
}

/**
 * SSR
 * @param context 
 */
export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {}
  }
}

export default StaffAdd
