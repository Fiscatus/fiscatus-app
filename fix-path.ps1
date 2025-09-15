# Script para corrigir o PATH do PowerShell
# Execute este script sempre que abrir um novo terminal

Write-Host "Corrigindo PATH do sistema..." -ForegroundColor Green

# Restaurar o PATH do sistema
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")

Write-Host "PATH restaurado com sucesso!" -ForegroundColor Green
Write-Host "Testando comandos..." -ForegroundColor Yellow

# Testar comandos
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Node.js não encontrado" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Node.js não encontrado" -ForegroundColor Red
}

try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ npm não encontrado" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ npm não encontrado" -ForegroundColor Red
}

try {
    $gitVersion = git --version 2>$null
    if ($gitVersion) {
        Write-Host "✅ Git: $gitVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Git não encontrado" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Git não encontrado" -ForegroundColor Red
}

Write-Host "`nComandos prontos para uso!" -ForegroundColor Cyan
