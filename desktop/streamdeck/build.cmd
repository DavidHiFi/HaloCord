@echo off
rem Builds Discord.exe, the Stream Deck stand-in (see discord-standin.cpp). Needs Visual Studio 2022 C++ tools.
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat" >nul
cd /d "%~dp0"
cl /nologo /O2 /MT /W3 /DUNICODE /D_UNICODE discord-standin.cpp /Fe:Discord.exe /link /SUBSYSTEM:WINDOWS user32.lib && del discord-standin.obj
