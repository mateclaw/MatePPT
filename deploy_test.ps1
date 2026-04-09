# 使用 OpenSSH 的替代版本（需要 Windows 10 1809+ 或安装 OpenSSH 客户端）
# ssh-keygen -t rsa -b 4096 -f ~/.ssh/自定义名称
# ssh-copy-id -i ~/.ssh/id_rsa.pub mateai@139.129.194.245
$ServerIP = "115.120.63.198"
$Username = "aippt"
# 注意：OpenSSH 使用普通私钥文件（不是 .ppk）
$PrivateKeyPath = "C:\Users\Administrator\.ssh\aippt"  
$RemotePath = "/home/aippt/frontend"
$LocalDistPath = ".\dist"
# 需要保留的 dist 子目录（非空时，这些目录不会被删除或重新上传）
$excludes = @('fonts')
# 1. 执行 pnpm build
Write-Host "正在执行 pnpm build..." -ForegroundColor Cyan
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"
Write-Host "[$timestamp] 构建开始" -ForegroundColor White

pnpm build

if (-not (Test-Path $LocalDistPath)) {
    Write-Host "构建失败，dist文件夹未生成！" -ForegroundColor Red
    exit 1
}

if (-not $excludes -or $excludes.Count -eq 0) {
    # 不保留任何目录，直接清空并全量上传
    ssh -i $PrivateKeyPath ${Username}@${ServerIP} "rm -rf ${RemotePath}/dist"
    scp -i $PrivateKeyPath -r $LocalDistPath ${Username}@${ServerIP}:${RemotePath}
} else {
    Write-Host ("检测到 excludes，保留目录: {0}" -f ($excludes -join ", ")) -ForegroundColor Yellow
    # 确保 dist 存在
    ssh -i $PrivateKeyPath ${Username}@${ServerIP} "mkdir -p ${RemotePath}/dist"

    # 删除 dist 下除 excludes 之外的内容
    $excludeFind = ($excludes | ForEach-Object { "-name '$_'" }) -join " -o "
    $cleanCommand = "if [ -d ${RemotePath}/dist ]; then find ${RemotePath}/dist -mindepth 1 \( ${excludeFind} \) -prune -o -exec rm -rf {} +; fi"
    ssh -i $PrivateKeyPath ${Username}@${ServerIP} $cleanCommand

    # 上传非 excludes 的内容
    $itemsToUpload = Get-ChildItem -Path $LocalDistPath
    foreach ($item in $itemsToUpload) {
        if ($excludes -contains $item.Name) { continue }
        $itemPath = Join-Path $LocalDistPath $item.Name
        scp -i $PrivateKeyPath -r $itemPath ${Username}@${ServerIP}:${RemotePath}/dist/
    }
}


$timestamp2 = Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"
Write-Host "[$timestamp2] 上传完成" -ForegroundColor White
