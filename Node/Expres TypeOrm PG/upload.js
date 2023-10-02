const path = require('path');
const Errors = require('../../core/Errors');

/**
 * @api {post} /upload Upload file to server
 * @apiGroup Upload
 *
 * @apiDescription
 * Method should be upload supported file to server</br>
 *
 * @apiPermission Providers
 *
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Content-Type": "multipart/form-data",
 *       "Access-Token": "token"
 *     }
 *
 *
 * @apiSuccessExample Success-Response:
 *
 *  {
 *      "url": "http://localhost:3002/img/b8956d159311b3be87e01b2385125d56.jpg"
 *  }
 *
 */

module.exports = function (request, response, next) {
    const config = request.app_config;
    try {
        if (!request.files || !request.files.file) {
            throw new Errors(`No files were uploaded. Make sure you have field with name «file» in your request`, 400);
        }

        let {file} = request.files;

        //CHECK supported file types
        if (!config.media.supportTypes.includes(file.mimetype)) {
            throw new Errors(`Mime type of File doesn't supported!`, 400);
        }

        let ext = path.extname(file.name);
        let newFileName = `${file.md5}${ext}`;

        let directory = path.resolve(config.media.directory);
        let savePath = path.join(directory, newFileName);

        file.mv(savePath, (error) => {
            if (error) {
                error.statusCode = 500;
                return next(error);
            }

            let imageUrl = `${config.media.serverUrl}/${newFileName}`;
            response.json({url: imageUrl});
        });

    } catch (error) {
        next(error);
    }
}
