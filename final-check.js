// final-check.js
const fs = require('fs');
const path = require('path');

class FinalValidator {
    constructor() {
        this.backendDir = path.join(__dirname, 'backend');
        this.results = [];
    }

    checkServerFiles() {
        const serverPath = path.join(this.backendDir, 'server.js');
        const apiPath = path.join(this.backendDir, 'api.js');
        
        if (fs.existsSync(serverPath)) {
            const content = fs.readFileSync(serverPath, 'utf8');
            if (content.length > 100) {
                this.results.push(' server.js: موجود وبه محتوى');
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
            } else {
                this.results.push(' api.js: موجود لكن محتواه قليل');
            }
        }
    }

    checkEmptyFiles() {
        const emptyFiles = [];
        
        const checkDir = (dir) => {
            const files = fs.readdirSync(dir);
            files.forEach(file => {
                const filePath = path.join(dir, file);
                const stats = fs.statSync(filePath);
                
                if (stats.isFile() && stats.size === 0) {
                    emptyFiles.push(filePath);
                }
            });
        };

        checkDir(path.join(this.backendDir, 'routes'));
        checkDir(path.join(this.backendDir, 'controllers'));

        if (emptyFiles.length > 0) {
            emptyFiles.forEach(file => {
                this.results.push( ملف فارغ: );
            });
        } else {
            this.results.push(' لا توجد ملفات فارغة');
        }
    }

    checkNamingConsistency() {
        const controllersDir = path.join(this.backendDir, 'controllers');
        const files = fs.readdirSync(controllersDir);
        
        const hasPascal = files.some(f => /^[A-Z]/.test(f));
        const hasCamel = files.some(f => /^[a-z]/.test(f));
        
        if (hasPascal && hasCamel) {
            this.results.push('  تسمية المتحكمات: مختلطة (PascalCase و camelCase)');
        } else if (hasPascal) {
            this.results.push(' تسمية المتحكمات: متسقة (PascalCase)');
        } else {
            this.results.push(' تسمية المتحكمات: متسقة (camelCase)');
        }
    }

    runCheck() {
        console.log(' التحقق النهائي من الهيكل...\n');
        
        this.checkServerFiles();
        this.checkEmptyFiles();
        this.checkNamingConsistency();

        console.log(' النتائج:');
        console.log('==========');
        this.results.forEach(result => console.log(result));

        const errors = this.results.filter(r => r.startsWith('')).length;
        const warnings = this.results.filter(r => r.startsWith('')).length;

        console.log(\n الملخص:  أخطاء,  تحذيرات);

        if (errors === 0) {
            console.log('\n المشروع جاهز تماماً للتشغيل!');
            return true;
        } else {
            console.log('\n يرجى إصلاح الأخطاء قبل المتابعة');
            return false;
        }
    }
}

const validator = new FinalValidator();
validator.runCheck();
