@echo off
rem Builds halocord-loopback.exe (per-process screen share sound). Needs Visual Studio 2022 C++ tools.
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat" >nul
cd /d "%~dp0"
cl /nologo /O2 /EHsc /MT /W3 /DUNICODE /D_UNICODE halocord-loopback.cpp /Fe:halocord-loopback.exe /link /SUBSYSTEM:CONSOLE && del halocord-loopback.obj
