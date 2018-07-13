var fs = require('fs');
var path = require('path');



var webset = (function() {
    var _webPath = "";
    var _fileCount = 0;
    var _errLogPath = "./log/err.txt";
    var _runLogPath = "./log/log.txt";
    var _newLine = "\r\n-------------------------------------------\r\n";

    var _replaceWeb = function() {
        _mkDir();
        if ("" == _webPath) {
            data = fs.readFileSync('./web.xml', 'utf-8');
            var reg = /\<WebPath\>(.+)\<\/WebPath\>/gmi;
            var m = reg.exec(data);
            if (m && m.length > 0) {
                _webPath = m[1];
                _replaceDir(_webPath);
            } else {
                console.log('网站路径解析错误!');
            }
        }
    };

    var _replaceDir = function(dic) {
        fs.readdir(dic, function(err, files) {
            if (err) {
                _writeErrLog(err);
            } else {
                _replaceFiles(dic, files);
            }
        });
    };

    var _replaceFiles = function(dic, files) {
        _this = this;
        files.forEach(function(fileName) {
            var fileDir = path.join(dic, fileName);

            // 根据文件全路径获取文件信息
            fs.stat(fileDir, function(err, stats) {
                if (err) {
                    _writeErrLog(err);
                } else {
                    var isFile = stats.isFile();
                    var isDir = stats.isDirectory();
                    if (isFile) {
                        if (fileDir.match(/.+(Views).+(.html)$/gi) && !fileDir.match(/shared/gi)) {
                            if(!fileDir.match(/_ViewStart/gi))
                            {
                                fs.readFile(fileDir, 'utf8', function(err, data) {
                                    _replaceHtml(fileDir);
                                })
                            }
                        }
                    }
                    if (isDir) {
                        _replaceDir(fileDir)
                    }
                }
            });
        });
    };

    var _replaceHtml = function(fileDir) {
        fs.readFile(fileDir, 'utf8', function(err, data) {
            if (err) {
                _writeErrLog(err);
            } else {
                var random = Math.random();
                var result = data.replace(/(\~\/Scripts\/AP\/.+)(\.js)(.*)/gi, "$1$2" + "?ver=" + random + "\"\></script>");
                fs.writeFile(fileDir, result, 'utf8', function(err) {
                    if (err) {
                        _writeErrLog(err);
                    } else {
                        _fileCount += 1;
                        _writeRunLog(fileDir);
                        console.log(fileDir + "  替换完成!")
                    }
                })
            }
        })
    };


    // 记录替换日志
    var _writeRunLog = function(fileDir) {
       
        var info = "No:" + _fileCount + "   " + fileDir + "\r\n";
        fs.appendFile(_runLogPath, info, function(err) {
            if (err) {
                console.log(err);
            }
        })
    }

    // 记录错误日志
    var _writeErrLog = function(err) {
        
        var info = _newLine + err;
        fs.appendFile(_errLogPath, info, function(err) {
            if (err) {
                console.log(err);
            }
        });
    };

    var _mkDir = function() {
        fs.exists('./log', function(exists) {
            if (!exists) {
                fs.mkdir('./log', function(err) {
                    console.log(err);
                })
            }
        })


    };

    return {
        ReplaceWeb: _replaceWeb

    }
})();

webset.ReplaceWeb();