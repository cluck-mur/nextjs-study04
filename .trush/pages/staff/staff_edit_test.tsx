import React from "react";
import { useRouter } from "next/router";

const StaffEdit = ({ message }) => {
  const router = useRouter();

  return (
    <React.Fragment>
      <form method="post" action="staff_edit_check">
        <input type="text" width="100px" name="name" defaultValue="ぴろぴろぴろ" />
        <br />
        <input type="button" onClick={() => router.back()} value="戻る" />
        <input type="submit" value="OK" />
      </form>
    </React.Fragment>
  );
};

StaffEdit.getInitialProps = async (context: any) => {
  return { message: "テスト getInitialProps" };
};

export default StaffEdit;
