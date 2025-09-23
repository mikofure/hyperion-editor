; CEF Quickstart NSIS Installer Script
; Modern UI 2.0

!include "MUI2.nsh"

; General
Name "CEF Quickstart"
OutFile "CEF Quickstart-Setup.exe"
Unicode True

; Default installation folder
InstallDir "$LOCALAPPDATA\CEF Quickstart"

; Get installation folder from registry if available
InstallDirRegKey HKCU "Software\CEF Quickstart" ""

; Request application privileges
RequestExecutionLevel user

; Variables
Var StartMenuFolder

; Interface Settings
!define MUI_ABORTWARNING
!define MUI_ICON "assets\icon.ico"
!define MUI_UNICON "assets\icon.ico"

; Welcome page
!insertmacro MUI_PAGE_WELCOME

; License page
!define MUI_LICENSEPAGE_CHECKBOX
!insertmacro MUI_PAGE_LICENSE "..\..\LICENSE"

; Components page
!insertmacro MUI_PAGE_COMPONENTS

; Directory page
!insertmacro MUI_PAGE_DIRECTORY

; Start menu page
!define MUI_STARTMENUPAGE_REGISTRY_ROOT "HKCU"
!define MUI_STARTMENUPAGE_REGISTRY_KEY "Software\CEF Quickstart"
!define MUI_STARTMENUPAGE_REGISTRY_VALUENAME "Start Menu Folder"
!insertmacro MUI_PAGE_STARTMENU Application $StartMenuFolder

; Installation page
!insertmacro MUI_PAGE_INSTFILES

; Finish page
!define MUI_FINISHPAGE_RUN "$INSTDIR\CefQuickstart.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Launch Cef Quickstart"
!insertmacro MUI_PAGE_FINISH

; Uninstaller pages
!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

; Languages
!insertmacro MUI_LANGUAGE "English"

; Version Information
VIProductVersion "1.0.0.0"
VIAddVersionKey "ProductName" "CEF Quickstart"
VIAddVersionKey "CompanyName" "Mikofure Project"
VIAddVersionKey "LegalCopyright" "Copyright 2025 Mikofure Project"
VIAddVersionKey "FileDescription" "CEF Quickstart Installer"
VIAddVersionKey "FileVersion" "1.0.0.0"
VIAddVersionKey "ProductVersion" "1.0.0.0"

; Installer sections
Section "CEF Quickstart Core" SecCore
  SectionIn RO
  
  ; Set output path to the installation directory
  SetOutPath "$INSTDIR"
  
  ; Install main application files
  File /r "..\..\build\Release\*"
  
  ; Store installation folder
  WriteRegStr HKCU "Software\CEF Quickstart" "" $INSTDIR
  
  ; Create uninstaller
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  
  ; Add to Add/Remove Programs
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\CEF Quickstart" "DisplayName" "CEF Quickstart"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\CEF Quickstart" "UninstallString" "$INSTDIR\Uninstall.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\CEF Quickstart" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Cef Quickstart" "DisplayIcon" "$INSTDIR\CefQuickstart.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Cef Quickstart" "Publisher" "Mikofure Project"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\Cef Quickstart" "DisplayVersion" "1.0.0"
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\CEF Quickstart" "NoModify" 1
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\CEF Quickstart" "NoRepair" 1
  
SectionEnd

Section "Desktop Shortcut" SecDesktop
  CreateShortcut "$DESKTOP\Cef Quickstart.lnk" "$INSTDIR\CefQuickstart.exe" "" "$INSTDIR\CefQuickstart.exe" 0
SectionEnd

Section "Start Menu Shortcuts" SecStartMenu
  !insertmacro MUI_STARTMENU_WRITE_BEGIN Application
    
    ; Create shortcuts
    CreateDirectory "$SMPROGRAMS\$StartMenuFolder"
    CreateShortcut "$SMPROGRAMS\$StartMenuFolder\Cef Quickstart.lnk" "$INSTDIR\CefQuickstart.exe" "" "$INSTDIR\CefQuickstart.exe" 0
    CreateShortcut "$SMPROGRAMS\$StartMenuFolder\Uninstall\Cef Quickstart.lnk" "$INSTDIR\Uninstall.exe"
    
  !insertmacro MUI_STARTMENU_WRITE_END
SectionEnd

; Section descriptions
!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
  !insertmacro MUI_DESCRIPTION_TEXT ${SecCore} "Core CEF Quickstart application files (required)"
  !insertmacro MUI_DESCRIPTION_TEXT ${SecDesktop} "Create a desktop shortcut for CEF Quickstart"
  !insertmacro MUI_DESCRIPTION_TEXT ${SecStartMenu} "Create Start Menu shortcuts for CEF Quickstart"
!insertmacro MUI_FUNCTION_DESCRIPTION_END

; Uninstaller section
Section "Uninstall"
  
  ; Remove files and uninstaller
  RMDir /r "$INSTDIR"
  
  ; Remove shortcuts
  Delete "$DESKTOP\CEF Quickstart.lnk"
  
  !insertmacro MUI_STARTMENU_GETFOLDER Application $StartMenuFolder
  
  Delete "$SMPROGRAMS\$StartMenuFolder\CEF Quickstart.lnk"
  Delete "$SMPROGRAMS\$StartMenuFolder\Uninstall\CEF Quickstart.lnk"
  RMDir "$SMPROGRAMS\$StartMenuFolder"
  
  ; Remove registry keys
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\CEF Quickstart"
  DeleteRegKey HKCU "Software\CEF Quickstart"
  
  ; Refresh shell
  System::Call 'shell32.dll::SHChangeNotify(i, i, i, i) v (0x08000000, 0, 0, 0)'
  
SectionEnd