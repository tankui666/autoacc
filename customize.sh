#!/system/bin/sh
# 安装阶段强制设置脚本执行权限，确保开机脚本能被KSU执行
chmod 0755 "$MODPATH/service.sh"
chmod 0755 "$MODPATH/tools/list.sh"
chmod 0755 "$MODPATH/customize.sh"
