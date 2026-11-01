@echo off
rem Builds hckeys.exe, the global keybind helper (see hckeys.cpp). Needs Visual Studio 2022 C++ tools.
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat" >nul
cd /d "%~dp0"
cl /nologo /O2 /MT /W3 /DUNICODE /D_UNICODE hckeys.cpp /Fe:hckeys.exe /link /SUBSYSTEM:WINDOWS user32.lib && del hckeys.obj
