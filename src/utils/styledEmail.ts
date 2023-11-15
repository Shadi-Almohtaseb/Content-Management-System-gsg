import { Shop } from "../db/entities/Shop.js";
import { User } from "../db/entities/User.js";

export const createStyledEmail = (payload: User, generatedOTP: string) => {
  return `
    <html>
    <head>
      <style>
        body {
          font-family: "Arial", sans-serif;
          background-color: #f4f4f4;
          color: #333;
          margin: 1rem;
        }
        .message {
          font-size: 1.5rem;
          font-weight: 400;
          line-height: 1.5;
          margin: 0 0 1rem 0;
        }
        .code {
          font-size: 1.8rem;
          font-weight: 700;
          line-height: 1.5;
          color: #fff;
          padding: 10px 18px;
          border-radius: 6px;
          background-color: rgb(83, 122, 250);
        }
      </style>
    </head>
    <body>
      <h3 class="message">
        Hello <b>${payload.userName}</b>👋,
        <br />
        <br />
        Enter <b class="code">${generatedOTP}</b> in the app to verify your email address
        and complete your account setup.
      </h3>
      <br />
      <p>This code <b>expires in 1 hour</b>.</p>
    </body>
  </html>
  
    `;
}

export const createStyledEmailShop = (payload: Shop, generatedOTP: string) => {
  return `
    <html>
    <head>
      <style>
        body {
          font-family: "Arial", sans-serif;
          background-color: #f4f4f4;
          color: #333;
          margin: 1rem;
        }
        .message {
          font-size: 1.5rem;
          font-weight: 400;
          line-height: 1.5;
          margin: 0 0 1rem 0;
        }
        .code {
          font-size: 1.8rem;
          font-weight: 700;
          line-height: 1.5;
          color: #fff;
          padding: 10px 18px;
          border-radius: 6px;
          background-color: rgb(83, 122, 250);
        }
      </style>
    </head>
    <body>
      <h3 class="message">
        Hello <b>${payload.shopName}</b>👋,
        <br />
        <br />
        Enter <b class="code">${generatedOTP}</b> in the app to verify your email address
        and complete your account setup.
      </h3>
      <br />
      <p>This code <b>expires in 1 hour</b>.</p>
    </body>
  </html>
  
    `;
}