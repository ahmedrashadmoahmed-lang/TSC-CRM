// final-check-fixed.js
const fs = require('fs');
const path = require('path');

class FinalValidator {
    constructor() {
        this.currentDir = __dirname;
        this.results = [];
    }

    checkServerFiles() {
        const serverPath = path.join(this.currentDir, 'server.js');
        const apiPath = path.join(this.currentDir, 'api.js');
        
        if (fs.existsSync(serverPath)) {
            const content = fs.readFileSync(serverPath, 'utf8');
            if (content.length > 100) {
                this.results.push(' server.js: موجود وبه محتوى');
                const preview = content.substring(0, 100) + '...';
                this.results.push('    محتوى: ' + preview);
            } else {
                this.results.push(' server.js: موجود لكن محتواه قليل');
            }
        } else {
            this.results.push(' server.js: غير موجود');
        }

        if (fs.existsSync(apiPath)) {
            const content = fs.readFileSync(apiPath, 'utf8');
            if (content.length > 100) {
                this.results.push('  api.js: موجود وبه محتوى - قد يكون مكرراً');
                const preview = content.substring(0, 100) + '...';
                this.results.push('    محتوى: ' + preview);
            } else {
                this.results.push(' api.js: موجود لكن محتواه قليل');
            }
        } else {
            this.results.push(' api.js: غير موجود (جيد - تجنب الازدواجية)');
        }
    }

    checkEmptyFiles() {
        const emptyFiles = [];
        
        const checkDir = (dirName) => {
            const dirPath = path.join(this.currentDir, dirName);
            if (!fs.existsSync(dirPath)) {
                this.results.push(' مجلد ' + dirName + ' غير موجود');
                return;
            }
            
            const files = fs.readdirSync(dirPath);
            files.forEach(file => {
                const filePath = path.join(dirPath, file);
                const stats = fs.statSync(filePath);
                
                if (stats.isFile() && stats.size === 0) {
                    emptyFiles.push(dirName + '/' + file);
                }
            });
        };

        checkDir('routes');
        checkDir('controllers');

        if (emptyFiles.length > 0) {
            emptyFiles.forEach(file => {
                this.results.push(' ملف فارغ: ' + file);
            });
        } else {
            this.results.push(' لا توجد ملفات فارغة');
        }
    }

    runCheck() {
        console.log(' التحقق النهائي من هيكل المشروع...\\n');
        console.log(' المجلد الحالي: ' + this.currentDir + '\\n');
        
        this.checkServerFiles();
        console.log('');
        this.checkEmptyFiles();
        console.log('');

        console.log(' النتائج:');
        console.log('==========');
        this.results.forEach(result => console.log(result));
    }
}

const validator = new FinalValidator();
validator.runCheck();
