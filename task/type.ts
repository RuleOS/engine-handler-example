/*
 * @Author: syf
 * @Date: 2024-11-25 17:13:20
 * @LastEditors: syf
 * @LastEditTime: 2024-11-27 17:01:45
 * @Description: 
 * @FilePath: /engine-handler-example/task/type.ts
 */
// @ts-nocheck
import fs from "fs";

const fse = require('fs-extra')

export class Type {
    public static getAllFiles(path: string, files: []) {
        fs.readdirSync(path).forEach(function (file) {
            var subpath = path + '/' + file;
            if (fs.lstatSync(subpath).isDirectory()) {
                Type.getAllFiles(subpath, files);
            } else {
                files.push(path + '/' + file);
            }
        });
        return files;
    }


    public static syncV3Artifacts() {
        let selfDir = './artifacts/contracts/V3';
        if (!fs.existsSync(selfDir)) {
            fs.mkdirSync(selfDir, {recursive: true});
        }
        fse.copySync("./engine-artifacts", selfDir)
        console.log("import sdk-v3 artifacts successfully!");
    
    }



}

