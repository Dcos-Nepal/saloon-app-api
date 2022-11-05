export class Helper {
  static customFileName(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    let fileExtension = '';

    if (file.mimetype.indexOf('jpeg') > -1) {
      fileExtension = 'jpg';
    } else if (file.mimetype.indexOf('png') > -1) {
      fileExtension = 'png';
    }

    const originalName = file.originalname.split('.')[0];

    cb(null, originalName.replace(' ', '-') + '-' + uniqueSuffix + '.' + fileExtension);
  }

  static destinationPath(req, file, cb) {
    cb(null, './uploads');
  }

  static imageFileFilter(req: any, file: any, callback: any) {
    if (!!file && !file?.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      req.fileValidationError = 'Only inage files are allowed!';
      return callback(null, false);
    }

    return callback(null, true);
  }
}
