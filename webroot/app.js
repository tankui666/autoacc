// 无障碍开机自启 - WebUI 主逻辑
(function () {
  var CONF = '/data/adb/modules/autoacc/config/acc.conf';
  var K = window.$K;

  var apps = [];            // 全部应用信息
  var enabledMap = {};      // 已授权无障碍: 包名 -> 完整服务名
  var checkedMap = {};      // 已勾选(写入配置): 包名 -> 完整服务名
  var state = { showSystem: false, keyword: '' };
  var refreshing = false;

  var el = {
    search: document.getElementById('search'),
    systemToggle: document.getElementById('systemToggle'),
    list: document.getElementById('list'),
    count: document.getElementById('count'),
    loading: document.getElementById('loading'),
    pulldown: document.getElementById('pulldown')
  };

  // ---------- 数据加载 ----------
  async function loadEnabled() {
    enabledMap = {};
    try {
      var raw = await K.exec('settings get secure enabled_accessibility_services');
      String(raw || '').split(':').forEach(function (s) {
        s = s.trim();
        if (!s) return;
        var pkg = s.split('/')[0];
        enabledMap[pkg] = s;
      });
    } catch (e) {}
  }

  async function loadChecked() {
    checkedMap = {};
    try {
      var raw = await K.exec('cat ' + CONF);
      String(raw || '').split('\n').forEach(function (line) {
        line = line.trim();
        if (!line || line.indexOf('#') === 0) return;
        if (line.indexOf('/') < 0) return;
        checkedMap[line.split('/')[0]] = line;
      });
    } catch (e) {}
  }

  function loadApps() {
    var pkgs = K.listPackages('all');
    var info = K.getPackagesInfo(pkgs);
    apps = (info || []).map(function (p) {
      return { pkg: p.packageName, label: p.appLabel || p.packageName, isSystem: !!p.isSystem };
    }).sort(function (a, b) { return a.label.localeCompare(b.label); });
  }

  // 重新加载全部数据并渲染
  async function reload() {
    if (refreshing) return;
    refreshing = true;
    el.pulldown.classList.add('active', 'loading-txt');
    el.pulldown.textContent = '正在刷新…';
    try {
      await Promise.all([loadEnabled(), loadChecked()]);
      loadApps();
      render();
      K.toast('已刷新');
    } catch (e) {
      K.toast('刷新失败');
    } finally {
      el.pulldown.classList.remove('active', 'loading-txt');
      el.pulldown.textContent = '↓ 下拉刷新';
      refreshing = false;
    }
  }

  // 尝试探测某包声明的无障碍服务名（尽力而为）
  async function detectService(pkg) {
    try {
      var out = await K.exec('dumpsys package ' + pkg + ' | grep -iE "BIND_ACCESSIBILITY_SERVICE" -B4 | grep -oE "' + pkg + '/[A-Za-z0-9_.]+" | head -1');
      var s = String(out || '').trim();
      return s || null;
    } catch (e) { return null; }
  }

  // ---------- 渲染 ----------
  function render() {
    var kw = state.keyword.toLowerCase();
    var rows = apps.filter(function (a) {
      if (!state.showSystem && a.isSystem) return false;
      if (kw && a.label.toLowerCase().indexOf(kw) < 0 && a.pkg.toLowerCase().indexOf(kw) < 0) return false;
      return true;
    });

    // 排序：已勾选 → 已授权 → 未授权，各组内按名称
    rows.sort(function (x, y) {
      var cx = checkedMap[x.pkg] ? 1 : 0, cy = checkedMap[y.pkg] ? 1 : 0;
      if (cx !== cy) return cy - cx;
      var ex = enabledMap[x.pkg] ? 1 : 0, ey = enabledMap[y.pkg] ? 1 : 0;
      if (ex !== ey) return ey - ex;
      return x.label.localeCompare(y.label);
    });

    el.count.textContent = '共 ' + rows.length + ' 个应用';

    el.list.innerHTML = rows.map(function (a) {
      var enabled = !!enabledMap[a.pkg];
      var checked = !!checkedMap[a.pkg];
      var badge = a.isSystem ? '<span class="badge">系统</span>' : '';
      var right;
      if (enabled) {
        right = '<label class="switch"><input type="checkbox" data-pkg="' + a.pkg + '" ' + (checked ? 'checked' : '') + '><span class="slider"></span></label>';
      } else {
        right = '<button class="auth-btn" data-auth="' + a.pkg + '">授权</button>';
      }
      return '<div class="app-item">' +
        '<img class="app-icon" src="ksu://icon/' + a.pkg + '" alt="" loading="lazy">' +
        '<div class="app-info"><div class="app-name">' + esc(a.label) + ' ' + badge + '</div>' +
        '<div class="app-pkg">' + esc(a.pkg) + '</div></div>' +
        right + '</div>';
    }).join('');

    el.loading.style.display = 'none';
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ---------- 写配置 ----------
  async function addService(pkg, service) {
    await K.exec("grep -qF '" + service + "' " + CONF + " || echo '" + service + "' >> " + CONF);
  }

  async function removeService(pkg) {
    await K.exec("grep -vF '" + pkg + "/' " + CONF + " > " + CONF + ".tmp && mv " + CONF + ".tmp " + CONF);
  }

  // ---------- 事件 ----------
  el.search.addEventListener('input', function () { state.keyword = this.value; render(); });

  el.systemToggle.addEventListener('change', function () { state.showSystem = this.checked; render(); });

  el.list.addEventListener('change', async function (e) {
    var cb = e.target;
    if (!cb.dataset.pkg) return;
    var 
