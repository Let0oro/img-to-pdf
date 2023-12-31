// We declared all our imports
const express = require("express");
const fs = require("fs");
const multer = require("multer");
const { createWorker } = require("tesseract.js");

const app = express();
// Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage }).single("avatar");

const main = async (img, res) => {
    console.log("HEYYYYYY");
    const worker = await createWorker('spa+eng', 1, {
        logger: m => console.log(m.progress),
    });
    // const rectangle = { left: 0, top: 0, width: 500, height: 250 };

    // const {data: {text}} = await worker.recognize(img, rectangle);
    const {data: {text, pdf}} = await worker.recognize(img, {pdfTitle: 'Example PDF'}, {pdf: true});
    console.log(text);
    // await res.send(text);
    fs.writeFileSync('tesseract-ocr-result.pdf', Buffer.from(pdf));
    await res.redirect('/download');
    console.log('Generate PDF: tesseract-ocr-result.pdf');
    
    await worker.terminate();
};

app.set("view engine", "ejs");

// ROUTES
app.get("/", (req, res) => {
  res.render("index");
});

app.get('/download', (req, res) => {
    const file = `${__dirname}/tesseract-ocr-result.pdf`;
    res.download(file);
    fs.rm(file);
})

app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    fs.readFile(`./uploads/${req.file.originalname}`, (err, img) => {
      if (err) return console.log("this is your error:", err);

      main(img, res);
    });
  });
});

// Start up our server
const PORT = 5000 || process.env.PORT;
app.listen(PORT, () => console.log(`hey I'm runnig on port localhost:${PORT}`));
