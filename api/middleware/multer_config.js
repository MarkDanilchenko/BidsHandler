// --------------------------------------MULTER_CONFIG
const multer = require('multer');
const path = require('path');

// --------------------------------------FILES_STORAGE
const filesStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.join(__dirname, '../assets/uploads/avatars'));
	},
	filename: (req, file, cb) => {
		cb(null, `${file.fieldname}_${Math.trunc(Math.random() * 1_000_000).toString(16)}${path.extname(file.originalname)}`);
	},
});

const multer_config = multer({
	storage: filesStorage,
	fileFilter: (req, file, cb) => {
		if (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg') {
			cb(null, true);
		} else {
			req.avatar_formatError = 'Incorrect file format for avatar. Only .png, .jpg and .jpeg formats are allowed!';
			cb(null, false);
		}
	},
});

// --------------------------------------EXPORT
module.exports = { multer_config };
