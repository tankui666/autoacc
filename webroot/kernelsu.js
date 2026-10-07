// kernelsu 桥接封装（直接调用 KSU WebView 注入的 window.ksu 原生对象）
window.$K = (function () {
  var raw = window.ksu;

  // 执行 root shell 命令，返回 stdout
  function exec(cmd, opts) {
    return new Promise(function (resolve, reject) {
      var cb = 'kcb_' + Date.now() + '_' + Math.floor(Math.random() * 1e9);
      window[cb] = function (errno, stdout, stderr) {
        delete window[cb];
        if (errno === 0) resolve(stdout);
        else reject(new Error(stderr || 'errno ' + errno));
      };
      try {
        raw.exec(cmd, JSON.stringify(opts || {}), cb);
      } catch (e) {
        delete window[cb];
        reject(e);
      }
    });
  }

  // 列出包名，type: all / user / system
  function listPackages(type) {
    try { return JSON.parse(raw.listPackages(type || 'all')); }
    catch (e) { return []; }
  }

  // 获取包信息数组
  function getPackagesInfo(arr) {
    try { return JSON.parse(raw.getPackagesInfo(JSON.stringify(arr))); }
    catch (e) { return []; }
  }

  function toast(msg) {
    try { raw.toast ? raw.toast(msg) : 0; } catch (e) {}
  }

  // 启用 edge-to-edge，让状态栏与页面背景融合
  function enableEdgeToEdge(enable) {
    try { raw.enableEdgeToEdge ? raw.enableEdgeToEdge(!!enable) : 0; } catch (e) {}
  }

  function fullScreen(isFull) {
    try { raw.fullScreen ? raw.fullScreen(!!isFull) : 0; } catch (e) {}
  }

  return { exec: exec, listPackages: listPackages, getPackagesInfo: getPackagesInfo, toast: toast, enableEdgeToEdge: enableEdgeToEdge, fullScreen: fullScreen };
})();
