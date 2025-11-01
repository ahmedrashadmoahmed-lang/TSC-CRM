// project-validator.js
const fs = require('fs');
const path = require('path');

class ProjectValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.success = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
  }

  // التحقق من هيكل المجلدات
  checkFolderStructure() {
    const requiredFolders = [
      'config',
      'controllers', 
      'models',
      'routes',
      'middleware',
      'utils',
      'services'
    ];

    requiredFolders.forEach(folder => {
      if (fs.existsSync(folder)) {
        this.success.push(`✅ المجلد ${folder} موجود`);
      } else {
        this.warnings.push(`⚠️  المجلد ${folder} غير موجود - يفضل إنشاؤه`);
      }
    });
  }

  // التحقق من الملفات الأساسية
  checkEssentialFiles() {
    const essentialFiles = [
      'server.js',
      'package.json',
      '.env',
      'config/database.js',
      'models/User.js',
      'models/Customer.js', 
      'models/Invoice.js',
      'models/Product.js',
      'controllers/authController.js',
      'routes/auth.js',
      'routes/customers.js',
      'middleware/auth.js'
    ];

    essentialFiles.forEach(file => {
      if (fs.existsSync(file)) {
        // التحقق من محتوى الملف
        try {
          const content = fs.readFileSync(file, 'utf8');
          if (content.trim().length > 0) {
            this.success.push(`✅ الملف ${file} موجود وغير فارغ`);
          } else {
            this.errors.push(`❌ الملف ${file} فارغ`);
          }
        } catch (error) {
          this.errors.push(`❌ خطأ في قراءة الملف ${file}`);
        }
      } else {
        this.errors.push(`❌ الملف ${file} غير موجود`);
      }
    });
  }

  // التحقق من package.json
  checkPackageJson() {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      // التحقق من dependencies الأساسية
      const requiredDeps = ['express', 'mongoose', 'bcryptjs', 'jsonwebtoken', 'cors'];
      requiredDeps.forEach(dep => {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
          this.success.push(`✅ dependency ${dep} موجود`);
        } else {
          this.errors.push(`❌ dependency ${dep} غير موجود`);
        }
      });

      // التحقق من scripts
      const requiredScripts = ['start', 'dev'];
      requiredScripts.forEach(script => {
        if (packageJson.scripts && packageJson.scripts[script]) {
          this.success.push(`✅ script ${script} موجود`);
        } else {
          this.warnings.push(`⚠️  script ${script} غير موجود`);
        }
      });

    } catch (error) {
      this.errors.push('❌ خطأ في قراءة package.json');
    }
  }

  // التحقق من إعدادات قاعدة البيانات
  checkDatabaseConfig() {
    try {
      if (fs.existsSync('config/database.js')) {
        const dbConfig = fs.readFileSync('config/database.js', 'utf8');
        
        // تحقق بسيط من المحتوى
        if (dbConfig.includes('mongoose.connect') || dbConfig.includes('MongoDB')) {
          this.success.push('✅ إعدادات قاعدة البيانات موجودة');
        } else {
          this.warnings.push('⚠️  إعدادات قاعدة البيانات قد تحتاج مراجعة');
        }
      }
    } catch (error) {
      this.warnings.push('⚠️  لا يمكن التحقق من إعدادات قاعدة البيانات');
    }
  }

  // التحقق من ملف البيئة
  checkEnvFile() {
    if (fs.existsSync('.env')) {
      const envContent = fs.readFileSync('.env', 'utf8');
      const requiredVars = ['MONGODB_URI', 'JWT_SECRET', 'PORT'];
      
      requiredVars.forEach(envVar => {
        if (envContent.includes(envVar)) {
          this.success.push(`✅ متغير البيئة ${envVar} موجود`);
        } else {
          this.warnings.push(`⚠️  متغير البيئة ${envVar} غير موجود`);
        }
      });
    } else {
      this.warnings.push('⚠️  ملف .env غير موجود - يرجى إنشاء ملف .env');
    }
  }

  // التحقق من نماذج البيانات
  checkModels() {
    const models = ['User', 'Customer', 'Invoice', 'Product'];
    
    models.forEach(model => {
      const modelPath = `models/${model}.js`;
      if (fs.existsSync(modelPath)) {
        const content = fs.readFileSync(modelPath, 'utf8');
        
        // تحقق بسيط من الهيكل
        if (content.includes('mongoose.Schema') && content.includes('module.exports')) {
          this.success.push(`✅ نموذج ${model} صحيح`);
        } else {
          this.warnings.push(`⚠️  نموذج ${model} قد يحتاج مراجعة`);
        }
      }
    });
  }

  // تشغيل جميع الفحوصات
  runAllChecks() {
    console.log('🔍 بدء التحقق من هيكل المشروع...\n');
    
    this.checkFolderStructure();
    this.checkEssentialFiles();
    this.checkPackageJson();
    this.checkDatabaseConfig();
    this.checkEnvFile();
    this.checkModels();

    console.log('\n📊 نتائج التحقق:');
    console.log('================\n');

    // عرض النجاحات
    this.success.forEach(msg => console.log(msg));
    
    // عرض التحذيرات
    if (this.warnings.length > 0) {
      console.log('\n⚠️  التحذيرات:');
      this.warnings.forEach(warning => console.log(warning));
    }

    // عرض الأخطاء
    if (this.errors.length > 0) {
      console.log('\n❌ الأخطاء الحرجة:');
      this.errors.forEach(error => console.log(error));
    }

    // ملخص
    console.log('\n📈 الملخص:');
    console.log(`✅ النجاحات: ${this.success.length}`);
    console.log(`⚠️  التحذيرات: ${this.warnings.length}`);
    console.log(`❌ الأخطاء: ${this.errors.length}`);

    if (this.errors.length === 0) {
      console.log('\n🎉 المشروع جاهز للمرحلة التالية!');
      return true;
    } else {
      console.log('\n🔧 يرجى إصلاح الأخطاء قبل المتابعة');
      return false;
    }
  }
}

// تشغيل المحقق
const validator = new ProjectValidator();
const isValid = validator.runAllChecks();

module.exports = { ProjectValidator, validator, isValid };