import React from "react";
import styled from "styled-components";
import { useState, ChangeEvent, useRef } from "react";

/**
 * JSX形式のメッセージを生成する
 * @param messages
 */
export const GenJsxMessage = (messages: string[]) => {
  return (
    <React.Fragment>
      {messages.map((message) => {
        return (
          <React.Fragment>
            {message}
            <br />
          </React.Fragment>
        );
      })}
    </React.Fragment>
  );
};

/**
 * refererとhost+page_strの比較結果を返す
 * 一致: true
 * 不一致: false
 * @param referer
 * @param host
 * @param page_str
 */
export const CompReferer = (
  referer: string,
  host: string,
  page_str: string
): boolean => {
  if (referer == undefined || host == undefined || page_str == undefined) {
    // console.log("CompReferer(): " + "referer: " + referer);
    // console.log("CompReferer(): " + "host: " + host);
    // console.log("CompReferer(): " + "page_str: " + page_str);
    return false;
  }

  const referer_cuthttp: string[] = referer.split("//", 2);
  const compare_str = host + page_str;
  return referer_cuthttp[1].startsWith(compare_str);
};
