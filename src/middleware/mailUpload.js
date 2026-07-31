import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/mail");
  },

  filename(req, file, cb) {
    cb(
      null,
      Date.now() + "-" + Math.round(Math.random() * 10000) + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });

export default upload;