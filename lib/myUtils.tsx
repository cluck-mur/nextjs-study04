import React from "react";
import styled from "styled-components";
import { useState, ChangeEvent, useRef } from "react";
import fs, { ReadStream, WriteStream } from "fs";
import parse, { Body } from "then-busboy";
import { IncomingMessage } from "http";
import htmlspecialchars from "htmlspecialchars";

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

/**
 * イメージファイルコピー
 * @param rs
 * @param ws
 */
export const transferImageFile = async (rs: ReadStream, ws: WriteStream) => {
  for await (const chunk of rs) {
    await ws.write(chunk);
  }
};

/**
 * POST Bodyをパースする
 * npm then-busboy に依存
 * @param req 
 */
export const myParse = async (req: IncomingMessage) => {
  return await parse(req);
};

/**
 * POST BodyからFieldsをJsonで返す
 * 返すデータはhtmlspecialcharsで無害化済み
 * npm then-busboy に依存
 * @param body 
 */
export const sanitizeFields = (body: Body) => {
  let field: string = "{";
  let i = 0;
  body.map((entry) => {
    // console.log("----------\n");
    //console.log(entry);
    // console.log(entry.mime);
    if (entry.mime == "text/plain" || entry.mime == void 0) {
      if (i > 0) {
        field += ",";
      }
      const sanitized = htmlspecialchars(entry.value);
      field += `"${entry.fieldname}":"${sanitized}"`;
      i++;
    }
  });
  field += "}";
  const fields_json = JSON.parse(field);
  return fields_json
}
