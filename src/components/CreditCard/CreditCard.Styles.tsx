import { css, keyframes } from "@emotion/css";

export const creditCardBaseStyles = css`
  background-image:
    linear-gradient(
      to right bottom,
      #001489,
      #043cb5,
      #0263e0,
      #008cff,
      #66b2ff
    );
  box-shadow: 1px 1px #aaa3a3;
  box-shadow: 1px 1px #aaa3a3;
  min-height: 205px;
`;

export const logoStyles = css`
  width: 15%;
`;

const blinker = keyframes`
  50% {
    opacity: 0;
  }

`;

export const blinkText = css`
  animation: ${blinker} 1.5s linear infinite;
`;
