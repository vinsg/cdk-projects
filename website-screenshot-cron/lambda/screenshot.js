// dependencies
const AWS = require("aws-sdk");
const url = require("url");
const chromium = require("chrome-aws-lambda");

// S3 client
const s3 = new AWS.S3();

exports.handler = async function (event) {
  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();
  await page.goto(process.env.TARGET_URL, {
    waitUntil: "networkidle0",
    timeout: 3000000,
  });

  const screenshot = await page.screenshot({ fullPage: true });

  // Date
  const d = new Date();
  const day = d.getDate();
  const month = d.getMonth();
  const year = d.getFullYear();

  const key =
    url.parse(process.env.TARGET_URL).hostname +
    "/" +
    year +
    "-" +
    month +
    "-" +
    day +
    ".png";

  await s3
    .putObject({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: screenshot,
      ContentType: "image/png",
    })
    .promise();

  await browser.close();

  console.log("Screenshot ", key, "saved");
  return;
};