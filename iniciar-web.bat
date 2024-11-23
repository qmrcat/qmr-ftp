@echo off
set "nodePath=C:\path\to\node.exe"   :: Canvia això a la ruta del teu Node.js si no està en el PATH
set "scriptPath=C:\path\to\server.js"   :: Canvia això a la ruta del teu script Node.js

:: Minimitza la finestra
:: start /min "" "%nodePath%" "%scriptPath%"
start /min node server

exit