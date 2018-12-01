const fs = require('fs');
const path = require('path');

// Поиск конфигов в папке, формата .json

module.exports = (function searchConf(type = 'require', dir = '.') {
    const confmap = {};

    if (typeof dir == 'string') {
        dir = fs.readdirSync(path.resolve(__dirname, dir));
        dir.forEach(k => {
            let ext = k.split('.');
            if (ext[ext.length-1] == 'json') {
                ext.pop();
                switch (type) {
                    case 'require':
                        confmap[ext] = require(path.resolve(__dirname, k));
                        console.log(`Module ${k} required`);
                        break;
                    case 'buffer':
                        confmap[k] = fs.readFile(`./${k}`);
                        break;
                }
            }
        })
    }
    return confmap;
})();

// Стандартная модель конфига

// Валидация конфига
