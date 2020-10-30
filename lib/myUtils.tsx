import React from "react";
import styled from "styled-components";
import { useState, ChangeEvent, useRef } from "react";

export const GenJsxMessage = (messages: string[]) => {
  return <React.Fragment>
    {messages.map((message) => {
      return <React.Fragment>
        {message}<br />
        </React.Fragment>
    })}
  </React.Fragment>
}

