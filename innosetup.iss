#include "version.iss"  

#define RuTubeDlAppName "RuTube-DL"
#define RuTubeDlAppPublisher "ProjectSoft"
#define RuTubeDlAppURL "https://github.com/ProjectSoft-STUDIONIONS/rutube-nwjs-downloader"
#define RuTubeDlAppSupportURL "https://github.com/ProjectSoft-STUDIONIONS/rutube-nwjs-downloader/issues"
#define RuTubeDlAppUpdateURL "https://github.com/ProjectSoft-STUDIONIONS/rutube-nwjs-downloader/releases/latest"
#define RuTubeDlAppExeName "RuTube-DL.exe"

[Setup]
AppId={{BCAEDFF2-7216-4D1A-98F0-73C9C6769FAD}
AppName=RuTube-DL
AppVersion={#RuTubeDlAppVersion}
AppVerName=RuTube-DL {#RuTubeDlAppVersion}
AppPublisher={#RuTubeDlAppPublisher}
AppPublisherURL={#RuTubeDlAppURL}
AppSupportURL={#RuTubeDlAppSupportURL}
AppUpdatesURL={#RuTubeDlAppUpdateURL}
AppCopyright={#RuTubeDlAppPublisher}
VersionInfoVersion={#RuTubeDlAppVersion}
DefaultDirName={autopf}\{#RuTubeDlAppName}
DisableDirPage=yes
DisableProgramGroupPage=yes
PrivilegesRequired=admin
OutputDir=install
OutputBaseFilename=RuTube-DL-Setup
SetupIconFile=application\favicon.ico
UninstallDisplayIcon={app}\{#RuTubeDlAppExeName}
VersionInfoDescription=RuTube-DL {#RuTubeDlAppVersion}
VersionInfoProductName=RuTube-DL {#RuTubeDlAppVersion}
Compression=lzma
SolidCompression=yes
WizardStyle=modern
CloseApplications=force
MissingRunOnceIdsWarning=no
UsedUserAreasWarning=no

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "russian"; MessagesFile: "compiler:Languages\Russian.isl"

[CustomMessages]
english.AppName=RuTube-DL
russian.AppName=RuTube-DL
english.RunProgramm=Launch application «RuTube-DL» v{#RuTubeDlAppVersion}  
russian.RunProgramm=Запустить приложение «RuTube-DL» v{#RuTubeDlAppVersion}  
english.ProgramName=RuTube-DL
russian.ProgramName=RuTube-DL
english.StopProgramm=Stop «RuTube-DL»...
russian.StopProgramm=Остановить «RuTube-DL»...

[Files]
Source: "build\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Run]
Filename: "{app}\{#RuTubeDlAppExeName}"; Flags: postinstall nowait skipifsilent; Description: "{cm:RunProgramm}";

[UninstallDelete]
Type: filesandordirs; Name: {autopf}\{cm:ProgramName}
Type: filesandordirs; Name: {localappdata}\RuTube-DL      

[UninstallRun]
Filename: {sys}\taskkill.exe; Parameters: "/F /IM RuTube-DL.exe /T"; Flags: skipifdoesntexist runhidden waituntilterminated; StatusMsg: "{cm:StopProgramm}"

[Icons]
Name: "{autoprograms}\{cm:ProgramName}"; Filename: "{app}\{#RuTubeDlAppExeName}"
Name: "{autodesktop}\{cm:ProgramName}"; Filename: "{app}\{#RuTubeDlAppExeName}"