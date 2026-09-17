import nodemailer from "nodemailer";
import { PrivacyPreference } from "../models/PrivacyPreference";

/* -------------------------------------------------------------------------- */
/* Marketing Consent                                                         */
/* -------------------------------------------------------------------------- */

export const hasMarketingConsent = async (
  userId: string
): Promise<boolean> => {
  try {
    const preference = await PrivacyPreference.findOne({
      userId,
    });

    return preference?.marketingEmails || false;
  } catch (error) {
    console.error(
      "Error checking marketing consent:",
      error
    );

    // Fail closed for marketing emails.
    return false;
  }
};

/*
 * Transactional emails such as:
 * - Order confirmations
 * - OTP verification
 * - Shipping updates
 *
 * should be sent regardless of marketing consent.
 */

/* -------------------------------------------------------------------------- */
/* Shared helpers                                                             */
/* -------------------------------------------------------------------------- */

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const getFrontendUrl = () => {
  const isDev = process.env.DEV;

  return isDev
    ? "http://localhost:3000"
    : "https://bellescrt.shop";
};

const escapeHtml = (value: unknown) => {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const formatCurrency = (amount: number) => {
  return `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatStatus = (status: string) => {
  if (!status) return "Processing";

  return status.charAt(0).toUpperCase() + status.slice(1);
};

/* -------------------------------------------------------------------------- */
/* Brand                                                                       */
/* -------------------------------------------------------------------------- */

const brandHeader = (subtitle: string) => `
  <div style="
    background: linear-gradient(135deg, #21131d 0%, #301b2c 55%, #432344 100%);
    padding: 32px 28px;
    text-align: center;
  ">

    <div style="
      display: inline-block;
      width: 52px;
      height: 52px;
      line-height: 52px;
      border-radius: 16px;
      background: linear-gradient(135deg, #ec4899 0%, #d946ef 50%, #7c3aed 100%);
      color: #ffffff;
      font-size: 24px;
      font-weight: 800;
      margin-bottom: 14px;
      box-shadow: 0 10px 25px rgba(236, 72, 153, 0.25);
    ">
      ◆
    </div>

    <div style="
      color: #ffffff;
      font-size: 26px;
      line-height: 1.2;
      font-weight: 800;
      letter-spacing: -0.5px;
    ">
      Belles Avenue
    </div>

    <div style="
      margin-top: 6px;
      color: rgba(255,255,255,0.65);
      font-size: 10px;
      line-height: 1.4;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
    ">
      Jewellery &amp; Fashion
    </div>

    <div style="
      margin-top: 18px;
      color: rgba(255,255,255,0.85);
      font-size: 13px;
      line-height: 1.5;
      font-weight: 500;
    ">
      ${subtitle}
    </div>

  </div>
`;

const emailFooter = () => `
  <div style="
    background: #21131d;
    padding: 26px 24px;
    text-align: center;
  ">

    <p style="
      margin: 0;
      color: rgba(255,255,255,0.7);
      font-size: 12px;
      line-height: 1.7;
    ">
      Thank you for choosing
      <strong style="color: #f472b6;">
        Belles Avenue
      </strong>
    </p>

    <p style="
      margin: 8px 0 0;
      color: rgba(255,255,255,0.4);
      font-size: 11px;
      line-height: 1.6;
    ">
      Premium shopping experience
    </p>

    <p style="
      margin: 14px 0 0;
      color: rgba(255,255,255,0.3);
      font-size: 10px;
      line-height: 1.5;
    ">
      © 2026 Belles Avenue. All rights reserved.
    </p>

  </div>
`;

const emailWrapper = (
  content: string,
  headerSubtitle: string
) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >
  <meta
    name="x-apple-disable-message-reformatting"
  >
  <title>Belles Avenue</title>

  <style>
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        border-radius: 0 !important;
      }

      .email-content {
        padding: 28px 18px !important;
      }

      .mobile-padding {
        padding-left: 16px !important;
        padding-right: 16px !important;
      }

      .mobile-stack {
        display: block !important;
        width: 100% !important;
      }

      .mobile-center {
        text-align: center !important;
      }

      .mobile-full {
        width: 100% !important;
      }

      .otp-code {
        font-size: 30px !important;
        letter-spacing: 7px !important;
      }

      .hero-title {
        font-size: 24px !important;
      }

      .amount {
        font-size: 25px !important;
      }
    }
  </style>
</head>

<body style="
  margin: 0;
  padding: 0;
  background: #f7f3f7;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Helvetica,
    Arial,
    sans-serif;
  color: #21131d;
">

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="background: #f7f3f7;"
  >
    <tr>
      <td
        align="center"
        style="padding: 28px 12px;"
      >

        <table
          class="email-container"
          width="600"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            width: 600px;
            max-width: 600px;
            background: #ffffff;
            border-radius: 22px;
            overflow: hidden;
            box-shadow:
              0 12px 45px rgba(33,19,29,0.10);
          "
        >

          ${brandHeader(headerSubtitle)}

          <tr>
            <td
              class="email-content"
              style="
                padding: 38px 34px;
                background: #ffffff;
              "
            >
              ${content}
            </td>
          </tr>

          ${emailFooter()}

        </table>

        <div style="
          height: 16px;
          line-height: 16px;
          font-size: 1px;
        ">
          &nbsp;
        </div>

        <p style="
          margin: 0;
          color: #9c8f99;
          font-size: 10px;
          line-height: 1.5;
        ">
          This is an automated transactional email.
          Please do not reply directly to this message.
        </p>

      </td>
    </tr>
  </table>

</body>
</html>
`;

/* -------------------------------------------------------------------------- */
/* Order Confirmation                                                         */
/* -------------------------------------------------------------------------- */

export const sendOrderConfirmationEmail = async (
  email: string,
  orderData: {
    orderNumber: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      total: number;
    }>;
    total: number;
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    status: string;
  }
): Promise<any> => {
  try {
    const transporter = createTransporter();
    const frontendUrl = getFrontendUrl();

    const itemsHtml = orderData.items
      .map(
        (item) => `
          <tr>
            <td
              style="
                padding: 15px 12px;
                border-bottom: 1px solid #f0e8ef;
              "
            >
              <div style="
                color: #21131d;
                font-size: 13px;
                line-height: 1.4;
                font-weight: 650;
              ">
                ${escapeHtml(item.name)}
              </div>
            </td>

            <td
              align="center"
              style="
                padding: 15px 8px;
                border-bottom: 1px solid #f0e8ef;
                color: #827480;
                font-size: 13px;
              "
            >
              ${item.quantity}
            </td>

            <td
              align="right"
              style="
                padding: 15px 8px;
                border-bottom: 1px solid #f0e8ef;
                color: #665963;
                font-size: 13px;
              "
            >
              ${formatCurrency(item.price)}
            </td>

            <td
              align="right"
              style="
                padding: 15px 12px;
                border-bottom: 1px solid #f0e8ef;
                color: #c02678;
                font-size: 13px;
                font-weight: 700;
              "
            >
              ${formatCurrency(item.total)}
            </td>
          </tr>
        `
      )
      .join("");

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Order Confirmed • ${orderData.orderNumber} • Belles Avenue`,

      html: emailWrapper(
        `
          <!-- Success -->
          <div style="text-align: center;">

            <div style="
              display: inline-block;
              width: 64px;
              height: 64px;
              line-height: 64px;
              border-radius: 50%;
              background: #ecfdf5;
              border: 1px solid #a7f3d0;
              color: #059669;
              font-size: 32px;
              font-weight: 700;
            ">
              ✓
            </div>

            <h1
              class="hero-title"
              style="
                margin: 20px 0 8px;
                color: #21131d;
                font-size: 28px;
                line-height: 1.25;
                font-weight: 800;
                letter-spacing: -0.5px;
              "
            >
              Order Confirmed
            </h1>

            <p style="
              margin: 0 auto;
              max-width: 430px;
              color: #827480;
              font-size: 14px;
              line-height: 1.7;
            ">
              Thank you for shopping with Belles Avenue.
              Your order has been successfully placed.
            </p>

          </div>

          <!-- Order number -->
          <div style="
            margin-top: 28px;
            padding: 18px 20px;
            border-radius: 16px;
            background: linear-gradient(
              135deg,
              #fff1f7 0%,
              #faf5ff 100%
            );
            border: 1px solid #f5d5e7;
            text-align: center;
          ">

            <p style="
              margin: 0 0 7px;
              color: #9b8794;
              font-size: 10px;
              line-height: 1.4;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1.5px;
            ">
              Order Number
            </p>

            <p style="
              margin: 0;
              color: #c02678;
              font-size: 21px;
              line-height: 1.4;
              font-weight: 800;
              letter-spacing: 1px;
              word-break: break-word;
            ">
              ${escapeHtml(orderData.orderNumber)}
            </p>

          </div>

          <!-- Items -->
          <div style="margin-top: 28px;">

            <h2 style="
              margin: 0 0 12px;
              color: #21131d;
              font-size: 16px;
              line-height: 1.4;
              font-weight: 750;
            ">
              Your Order
            </h2>

            <div style="
              overflow: hidden;
              border: 1px solid #eee5eb;
              border-radius: 16px;
            ">

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  width: 100%;
                  border-collapse: collapse;
                "
              >

                <thead>
                  <tr style="background: #faf7fa;">

                    <th
                      align="left"
                      style="
                        padding: 11px 12px;
                        color: #9b8794;
                        font-size: 9px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                      "
                    >
                      Product
                    </th>

                    <th
                      align="center"
                      style="
                        padding: 11px 8px;
                        color: #9b8794;
                        font-size: 9px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                      "
                    >
                      Qty
                    </th>

                    <th
                      align="right"
                      style="
                        padding: 11px 8px;
                        color: #9b8794;
                        font-size: 9px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                      "
                    >
                      Price
                    </th>

                    <th
                      align="right"
                      style="
                        padding: 11px 12px;
                        color: #9b8794;
                        font-size: 9px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                      "
                    >
                      Total
                    </th>

                  </tr>
                </thead>

                <tbody>
                  ${itemsHtml}
                </tbody>

              </table>

            </div>
          </div>

          <!-- Total -->
          <div style="
            margin-top: 22px;
            padding: 20px;
            border-radius: 16px;
            background: #21131d;
          ">

            <table
              width="100%"
              cellpadding="0"
              cellspacing="0"
              border="0"
            >
              <tr>

                <td>
                  <p style="
                    margin: 0;
                    color: rgba(255,255,255,0.65);
                    font-size: 12px;
                  ">
                    Total Amount
                  </p>
                </td>

                <td align="right">
                  <p
                    class="amount"
                    style="
                      margin: 0;
                      color: #f472b6;
                      font-size: 27px;
                      line-height: 1.2;
                      font-weight: 800;
                    "
                  >
                    ${formatCurrency(orderData.total)}
                  </p>
                </td>

              </tr>
            </table>

          </div>

          <!-- Shipping -->
          <div style="
            margin-top: 22px;
            padding: 18px;
            border: 1px solid #eee5eb;
            border-radius: 16px;
          ">

            <p style="
              margin: 0 0 10px;
              color: #9b8794;
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1.4px;
            ">
              Shipping Address
            </p>

            <p style="
              margin: 0;
              color: #4e414b;
              font-size: 13px;
              line-height: 1.7;
            ">
              ${escapeHtml(orderData.shippingAddress.street)}<br>
              ${escapeHtml(orderData.shippingAddress.city)},
              ${escapeHtml(orderData.shippingAddress.state)}
              ${escapeHtml(orderData.shippingAddress.zipCode)}<br>
              ${escapeHtml(orderData.shippingAddress.country)}
            </p>

          </div>

          <!-- Status -->
          <div style="
            margin-top: 16px;
            padding: 13px 15px;
            border-radius: 12px;
            background: #ecfdf5;
            border: 1px solid #d1fae5;
          ">

            <table
              width="100%"
              cellpadding="0"
              cellspacing="0"
              border="0"
            >
              <tr>

                <td width="20">
                  <div style="
                    width: 9px;
                    height: 9px;
                    border-radius: 50%;
                    background: #10b981;
                  "></div>
                </td>

                <td>
                  <p style="
                    margin: 0;
                    color: #047857;
                    font-size: 12px;
                    font-weight: 700;
                  ">
                    Order Status:
                    ${escapeHtml(
                      formatStatus(orderData.status)
                    )}
                  </p>
                </td>

              </tr>
            </table>

          </div>

          <!-- CTA -->
          <div style="
            margin-top: 28px;
            text-align: center;
          ">

            <a
              href="${frontendUrl}/orders?id=${encodeURIComponent(
                orderData.orderNumber
              )}"
              style="
                display: inline-block;
                padding: 13px 25px;
                border-radius: 12px;
                background: linear-gradient(
                  135deg,
                  #ec4899 0%,
                  #d946ef 55%,
                  #7c3aed 100%
                );
                color: #ffffff;
                text-decoration: none;
                font-size: 13px;
                font-weight: 700;
                box-shadow:
                  0 8px 20px rgba(236,72,153,0.22);
              "
            >
              View Order Details
            </a>

          </div>

          <p style="
            margin: 24px 0 0;
            color: #9b8794;
            font-size: 11px;
            line-height: 1.7;
            text-align: center;
          ">
            We'll keep you updated as your order moves
            through the next steps.
          </p>
        `,
        "Your order has been successfully placed"
      ),
    };

    const result =
      await transporter.sendMail(mailOptions);

    return result;
  } catch (error) {
    console.error(
      "Error sending order confirmation email:",
      error
    );

    throw error;
  }
};

/* -------------------------------------------------------------------------- */
/* OTP Email                                                                  */
/* -------------------------------------------------------------------------- */

export const sendOtpEmail = async (
  email: string,
  otp: number
): Promise<any> => {
  try {
    const transporter = createTransporter();
    const frontendUrl = getFrontendUrl();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Verification Code • Belles Avenue",

      html: emailWrapper(
        `
          <!-- Hero -->
          <div style="text-align: center;">

            <div style="
              display: inline-block;
              width: 64px;
              height: 64px;
              line-height: 64px;
              border-radius: 18px;
              background: linear-gradient(
                135deg,
                #fce7f3 0%,
                #f5d0fe 100%
              );
              color: #c02678;
              font-size: 29px;
              font-weight: 800;
            ">
              #
            </div>

            <h1
              class="hero-title"
              style="
                margin: 20px 0 8px;
                color: #21131d;
                font-size: 27px;
                line-height: 1.25;
                font-weight: 800;
                letter-spacing: -0.5px;
              "
            >
              Verify Your Email
            </h1>

            <p style="
              margin: 0 auto;
              max-width: 430px;
              color: #827480;
              font-size: 14px;
              line-height: 1.7;
            ">
              Use the verification code below to
              complete your Belles Avenue account setup.
            </p>

          </div>

          <!-- OTP -->
          <div style="
            margin-top: 30px;
            padding: 25px 18px;
            border-radius: 18px;
            background: linear-gradient(
              135deg,
              #fff1f7 0%,
              #faf5ff 100%
            );
            border: 1px solid #f5d5e7;
            text-align: center;
          ">

            <p style="
              margin: 0 0 12px;
              color: #9b8794;
              font-size: 10px;
              line-height: 1.4;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1.7px;
            ">
              Verification Code
            </p>

            <div
              class="otp-code"
              style="
                color: #c02678;
                font-size: 38px;
                line-height: 1.2;
                font-weight: 800;
                letter-spacing: 10px;
                font-family: 'Courier New', monospace;
              "
            >
              ${escapeHtml(otp)}
            </div>

            <p style="
              margin: 13px 0 0;
              color: #9b8794;
              font-size: 11px;
            ">
              Enter this code on the verification page.
            </p>

          </div>

          <!-- Expiry -->
          <div style="
            margin-top: 18px;
            padding: 14px 16px;
            border-radius: 12px;
            background: #fff7ed;
            border: 1px solid #fed7aa;
            text-align: center;
          ">

            <p style="
              margin: 0;
              color: #c2410c;
              font-size: 12px;
              line-height: 1.6;
              font-weight: 600;
            ">
              This verification code expires in
              <strong>1 minute</strong>.
            </p>

          </div>

          <!-- CTA -->
          <div style="
            margin-top: 26px;
            text-align: center;
          ">

            <a
              href="${frontendUrl}/verify-otp?email=${encodeURIComponent(
                email
              )}"
              style="
                display: inline-block;
                padding: 13px 25px;
                border-radius: 12px;
                background: linear-gradient(
                  135deg,
                  #ec4899 0%,
                  #d946ef 55%,
                  #7c3aed 100%
                );
                color: #ffffff;
                text-decoration: none;
                font-size: 13px;
                font-weight: 700;
                box-shadow:
                  0 8px 20px rgba(236,72,153,0.22);
              "
            >
              Verify Email Address
            </a>

          </div>

          <!-- Security -->
          <div style="
            margin-top: 28px;
            padding: 17px;
            border-radius: 15px;
            background: #faf7fa;
            border: 1px solid #eee5eb;
          ">

            <p style="
              margin: 0 0 5px;
              color: #21131d;
              font-size: 12px;
              line-height: 1.5;
              font-weight: 750;
            ">
              🔒 Security Notice
            </p>

            <p style="
              margin: 0;
              color: #827480;
              font-size: 11px;
              line-height: 1.7;
            ">
              If you didn't request this verification code,
              you can safely ignore this email.
              Never share your verification code with anyone.
            </p>

          </div>

          <!-- Email -->
          <div style="
            margin-top: 20px;
            text-align: center;
          ">

            <p style="
              margin: 0;
              color: #9b8794;
              font-size: 10px;
              line-height: 1.5;
            ">
              Verification requested for
            </p>

            <p style="
              margin: 4px 0 0;
              color: #4e414b;
              font-size: 12px;
              font-weight: 650;
              word-break: break-word;
            ">
              ${escapeHtml(email)}
            </p>

          </div>
        `,
        "Secure account verification"
      ),
    };

    const result =
      await transporter.sendMail(mailOptions);

    return result;
  } catch (error) {
    console.error(
      "Error sending OTP email:",
      error
    );

    throw error;
  }
};