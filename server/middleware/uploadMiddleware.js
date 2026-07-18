import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|csv/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
  const isImageMime = /jpg|jpeg|png/.test(file.mimetype);
  const isCsvMime = file.mimetype.includes('csv') || file.mimetype.includes('excel');

  if (extname && (isImageMime || isCsvMime)) {
    return cb(null, true);
  } else {
    cb(new Error('Images and CSV files only!'));
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

export default upload;
