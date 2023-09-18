// FileChooser.js

// Based on example: https://medium.com/stackfame/get-list-of-all-files-in-a-directory-in-node-js-befd31677ec5

//requiring path and fs modules
const osPath = require('path');
const fs = require('fs');

class FileChooser {
    constructor() {
        this.fileList = [];
        this.scan("/../html/images", this);
    }
    
    scan(path, self) {
        self.fileList = [];
        var directoryPath = osPath.join(__dirname, path);
        fs.readdir(directoryPath, function (err, files) {
            //handling error
            if (err) {
                console.log('Unable to scan directory: ' + err);
                return false;
            } 
            console.log("scanned logo directory");
            files.forEach(function (file) {
                // Do whatever you want to do with the file
                self.fileList.push(file);
                console.log(file); 
            });
            return true;
        });
    }
    
    get() {
        console.log("returning logo list");
        this.fileList.forEach(function (file) {
            // Do whatever you want to do with the file
            console.log(file); 
        });
        return this.fileList;
    }
}

var fileChooser = new FileChooser();

module.exports = fileChooser;