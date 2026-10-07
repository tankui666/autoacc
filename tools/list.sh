#!/system/bin/sh
# 查看当前已开启的无障碍服务列表，每个一行，方便直接复制
echo "=== 当前已开启的无障碍服务（每行一个）==="
settings get secure enabled_accessibility_services | tr ':' '\n'
echo ""
echo "=== 使用方法 ==="
echo "把上面任意一行完整复制，写入配置文件（每行一个）："
echo "/data/adb/modules/autoacc/config/acc.conf"
