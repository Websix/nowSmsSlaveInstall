color 0a
xcopy /S /Y /I  nowSmsSlave c:\nowSmsSlave
xcopy /Y "files\nowSmsSlave.bat" "%HOMEDRIVE%%HOMEPATH%\Desktop"
files\node.msi

rem Ensure this Node.js and npm are first in the PATH
set PATH=%APPDATA%\npm;%~dp0;%PATH%

setlocal enabledelayedexpansion
pushd "%~dp0"
popd
endlocal

rem If we're in the node.js directory, change to the user's home dir.
if "%CD%\"=="%~dp0" cd /d "%HOMEDRIVE%%HOMEPATH%"

npm install http-server -g