const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const puppeteer = require("puppeteer");
const path = require("path");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.static(__dirname));

app.get("/api/image", async (req, res) => {
  try {
    const unsplashUrl =
      "https://images.unsplash.com/photo-1527800792452-506aacb2101f?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"; // Fetch a random landscape image from Unsplash

    await delay(10000);

    const response = await fetch(unsplashUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch image: ${response.status} ${response.statusText}`
      );
    }

    const imageData = {
      id: 1,
      url: response.url,
      description: "Uploaded image",
    };

    res.json([imageData]);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

app.use(express.static("public"));

app.get("/generate-pdf", async (req, res) => {
  let browser;
  let page;
  try {
    // Navigate to the page

    const imageResponse = await fetch("http://localhost:4000/api/image");
    const imageData = await imageResponse.json();
    console.log({ imageData });

    if (!imageResponse.ok || !imageData || !imageData.length) {
      throw new Error("Failed to fetch image data");
    }

    const latestImageUrl = imageData[0].url;

    browser = await puppeteer.launch();
    page = await browser.newPage();
    const indexPath = path.join(__dirname, "index.html");
    await page.goto("file://" + indexPath, {
      waitUntil: "networkidle0",
    });

    //Update the image source on the page with the latest image URL
    await page.evaluate((imageUrl) => {
      document.querySelector("img").src = imageUrl;
    }, latestImageUrl);

    const imageSelector = "img";
    await page.waitForSelector(imageSelector, {
      visible: true,
    });

    // Generate PDF of the current page
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=generated_pdf.pdf"
    );

    // Send the PDF as a download
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF");
  }

  await browser.close();
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
