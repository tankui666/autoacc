#!/system/bin/sh
# 开机自动启用 config 目录中列出的无障碍服务（service 阶段执行）
# 关键：等待系统完全启动完成，确保 settings 提供器就绪后再写入

# 等待 boot 完成（最多等 300 秒，防死循环）
i=0
while [ "$(getprop sys.boot_completed)" != "1" ]; do
    i=$((i+1))
    [ "$i" -ge 300 ] && break
    sleep 1
done

# 系统启动后再额外等待，确保 settings 数据库稳定
sleep 10

CONF="/data/adb/modules/autoacc/config/acc.conf"
[ ! -f "$CONF" ] && exit 0

# 当前已开启的无障碍列表
ENABLED=$(settings get secure enabled_accessibility_services)

# 遍历配置文件，逐条追加未开启的无障碍服务
while IFS= read -r line || [ -n "$line" ]; do
    [ -z "$line" ] && continue
    case "$line" in \#*) continue ;; esac
    if ! echo "$ENABLED" | grep -q "$line"; then
        NEW_LIST="${ENABLED}:${line}"
        settings put secure enabled_accessibility_services "$NEW_LIST"
        settings put secure accessibility_enabled 1
        ENABLED="$NEW_LIST"
    fi
done < "$CONF"

exit 0
