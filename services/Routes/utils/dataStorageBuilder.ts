import multer from "multer";

const diskStorageBuilder = (
    distinction: string,
    fileNameFactory: (file: Express.Multer.File) => string
) => {
    return multer({
        storage: multer.diskStorage({
            destination: (_, __, cb) => {
                cb(null, distinction);
            },
            filename: (_, file, cb) => {
                cb(null, fileNameFactory(file));
            },
        }),
    });
};

export default diskStorageBuilder;