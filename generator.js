function omitNonPublicMembers(key, value) {
    return (key.indexOf("_") === 0) ? undefined : value;
}

function omitPrivateMembers(key, value) {
    return (key.indexOf("__") === 0) ? undefined : value;
}

function newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

//The order AMP itself writes GenericModule.kvp in - the field declaration order of each section in
//GenericModuleConfig.cs. Keys not listed here are written after the ones that are, in the order the
//view model declares them.
const kvpKeyOrder = [
    "Meta.DisplayName",
    "Meta.Description",
    "Meta.OS",
    "Meta.AarchSupport",
    "Meta.Arch",
    "Meta.Author",
    "Meta.URL",
    "Meta.DisplayImageSource",
    "Meta.EndpointURIFormat",
    "Meta.ConfigManifest",
    "Meta.MetaConfigManifest",
    "Meta.ConfigRoot",
    "Meta.DeprecatedReason",
    "Meta.ResourceUsageInfo",
    "Meta.MinAMPVersion",
    "Meta.SpecificDockerImage",
    "Meta.DockerRequired",
    "Meta.DockerBaseReadOnly",
    "Meta.ContainerPolicy",
    "Meta.ContainerPolicyReason",
    "Meta.ExtraSetupStepsURI",
    "Meta.Prerequisites",
    "Meta.ExtraContainerPackages",
    "Meta.ConfigReleaseState",
    "Meta.NoCommercialUsage",
    "Meta.ConfigVersion",
    "Meta.ReleaseNotes",
    "Meta.BreakingReleaseNotes",
    "Meta.AppConfigId",
    "Meta.OriginalSource",
    "Meta.ImportableExtensions",
    "Meta.AppIsMultiIPAware",

    "App.DisplayName",
    "App.RootDir",
    "App.BaseDirectory",
    "App.StoresSupported",
    "App.SteamWorkshopDownloadLocation",
    "App.StoreSpecificSettings",
    "App.StoreDownloadLocations",
    "App.ExecutableWin",
    "App.ExecutableLinux",
    "App.WorkingDir",
    "App.LinuxCommandLineArgs",
    "App.WindowsCommandLineArgs",
    "App.CommandLineArgs",
    "App.UseLinuxIOREDIR",
    "App.AppSettings",
    "App.EnvironmentVariables",
    "App.CommandLineParameterFormat",
    "App.CommandLineParameterDelimiter",
    "App.ExitMethod",
    "App.ExitMethodWindows",
    "App.ExitTimeout",
    "App.ExitString",
    "App.ExitFile",
    "App.RestartDelaySeconds",
    "App.HasWriteableConsole",
    "App.HasReadableConsole",
    "App.UDPLogger",
    "App.SupportsLiveSettingsChanges",
    "App.LiveSettingChangeCommandFormat",
    "App.ForceIPBinding",
    "App.SupportsIPv6",
    "App.ApplicationIPBinding",
    "App.Ports",
    "App.AdminPortRef",
    "App.PrimaryApplicationPortRef",
    "App.UniversalSleepApplicationUDPPortRef",
    "App.UniversalSleepSteamQueryPortRef",
    "App.MaxUsers",
    "App.UseRandomAdminPassword",
    "App.PersistRandomPassword",
    "App.RemoteAdminPassword",
    "App.AdminMethod",
    "App.IgnoreSTDOUTAfterRCON",
    "App.AdminLoginTransform",
    "App.StripANSIControlCodes",
    "App.LoginTransformPrefix",
    "App.RCONConnectDelaySeconds",
    "App.RCONConnectRetrySeconds",
    "App.RCONHeartbeatMinutes",
    "App.RCONHeartbeatCommand",
    "App.RCONSelectIPMethod",
    "App.TelnetLoginFormat",
    "App.TelnetNewLineType",
    "App.TailLogFilePath",
    "App.UpdateSources",
    "App.PreStartStages",
    "App.CommandTriggers",
    "App.UserActions",
    "App.ForceUpdate",
    "App.ForceUpdateReason",
    "App.Compatibility",
    "App.SteamUpdateAnonymousLogin",
    "App.SteamForceLoginPrompt",
    "App.RapidStartup",
    "App.MonitorChildProcess", //Legacy - kept where the existing templates place it.
    "App.HasSuccessfullyUpdatedAtLeastOnce",
    "App.SmartExcludeExemptions",
    "App.SmartExcludeSupported",
    "App.DumpFullChildProcessTree",
    "App.MonitorChildProcessWaitMs", //Legacy
    "App.MonitorChildProcessName",
    "App.MonitorDirectChildOnly",
    "App.SupportsUniversalSleep",
    "App.UseSteamQueryForStatus",
    "App.WakeupMode",
    "App.ApplicationReadyMode",
    "App.QuiesceCommand",
    "App.DequiesceCommand",
    "App.QuiesceSettleDelayMilliseconds",

    "Console.FilterMatchRegex",
    "Console.FilterMatchReplacement",
    "Console.ThrowawayMessageRegex",
    "Console.AppReadyRegex",
    "Console.UserJoinRegex",
    "Console.UserLeaveRegex",
    "Console.UserChatRegex",
    "Console.UpdateAvailableRegex",
    "Console.PreConnectRegex",
    "Console.ConnectIPRegex",
    "Console.MetricsRegex",
    "Console.ServerInfoRegex",
    "Console.ServerAuthURLPromptRegex",
    "Console.ServerAuthAckRegex",
    "Console.ConsoleFormatRegex",
    "Console.DownloadProgressRegex",
    "Console.HideFromConsoleRegex",
    "Console.SuppressLogAtStart",
    "Console.ActivateLogRegex", //Legacy
    "Console.UserActions",

    "Limits.SleepMode",
    "Limits.SleepOnStart",
    "Limits.SleepDelayMinutes",
    "Limits.DozeDelay",
    "Limits.AutoRetryCount",
    "Limits.SleepStartThresholdSeconds",
];

//Stable sort - anything AMP doesn't write (or that was added since) keeps its relative order at the end.
function sortByKvpKeyOrder(keys) {
    return keys.slice().sort((a, b) => {
        var indexA = kvpKeyOrder.indexOf(a);
        var indexB = kvpKeyOrder.indexOf(b);
        if (indexA == indexB) { return 0; }
        if (indexA == -1) { return 1; }
        if (indexB == -1) { return -1; }
        return indexA - indexB;
    });
}

function downloadString(data, filename) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

ko.validation.init();

class generatorViewModel {
    constructor() {
        var self = this;
        this._availablePortOptions = ko.observableArray(['Custom Port', 'Main Game Port', 'Steam Query Port', 'RCON Port']);
        this._compatibility = ko.observable("None");
        this.Meta_DisplayName = ko.observable("").extend({ required: "Please enter an application name" });
        this.Meta_Description = ko.observable("");
        this.Meta_Arch = ko.observable("x86_64");
        this._Meta_Author = ko.observable("");
        this.Meta_Author = ko.computed(() => self._Meta_Author() + ' - Made with AMP Config Generator');
        this._Meta_GithubOrigin = ko.computed(() => 'https://github.com/' + self._Meta_Author() + '/AMPTemplates.git');
        this._Meta_GithubURL = ko.computed(() => 'https://github.com/' + self._Meta_Author() + '/AMPTemplates');
        this.Meta_URL = ko.observable("");
        this.Meta_MinAMPVersion = ko.observable("2.4.6.6");
        this.Meta_SpecificDockerImage = ko.computed(() => self._compatibility() != "None" ? (self._compatibility().substring(self._compatibility().length - 4) == "Xvfb" ? `cubecoders/ampbase:xvfb` : `cubecoders/ampbase:wine`) : ``);
        this.Meta_DockerRequired = ko.observable("False");
        this.Meta_ContainerPolicy = ko.observable("Supported");
        this.Meta_ContainerPolicyReason = ko.observable("");
        this.Meta_Prerequisites = ko.observable("[]");
        //this.Meta_ExtraContainerPackages = ko.observable("");
        //this.Meta_ConfigReleaseState = ko.observable("NotSpecified");
        //this.Meta_NoCommercialUsage = ko.observable("False");
        this.Meta_AppConfigId = ko.observable(newGuid());

        this._SupportsWindows = ko.observable(true);
        this._SupportsLinux = ko.observable(true);

        this.App_AdminMethod = ko.observable("STDIO");
        this.App_HasReadableConsole = ko.observable(true);
        this.App_HasWriteableConsole = ko.observable(true);
        this.App_DisplayName = ko.computed(() => this.Meta_DisplayName());
        this.App_CommandLineArgs = ko.observable("{{$PlatformArgs}} {{$FormattedArgs}}")
        this.App_WindowsCommandLineArgs = ko.observable("");
        this.App_CommandLineParameterFormat = ko.observable("-{0} \"{1}\"");
        this.App_CommandLineParameterDelimiter = ko.observable(" ");
        this.App_RapidStartup = ko.observable("false");
        this.App_ApplicationReadyMode = ko.observable("Immediate");
        this.App_ExitMethod = ko.observable("OS_CLOSE");
        this.App_ExitString = ko.observable("stop");
        //this.App_UseLinuxIOREDIR = ko.observable("False");
        this.App_ExitTimeout = ko.observable("30");
        this.App_ExitFile = ko.observable("app_exit.lck");
        this.App_SupportsLiveSettingsChanges = ko.observable("False");
        this.App_LiveSettingChangeCommandFormat = ko.observable("set {0} \"{1}\"");
        this.App_ApplicationIPBinding = ko.observable("0.0.0.0");
        this.App_AdminPortRef = ko.observable("RemoteAdminPort");
        this.App_UniversalSleepApplicationUDPPortRef = ko.observable("MainGamePort");
        this.App_PrimaryApplicationPortRef = ko.observable("MainGamePort");
        this.App_UniversalSleepSteamQueryPortRef = ko.observable("SteamQueryPort");
        this.App_MaxUsers = ko.observable("8");
        this.App_UseRandomAdminPassword = ko.observable("True");
        this.App_RemoteAdminPassword = ko.observable("");
        this.App_AdminLoginTransform = ko.observable("None");
        this.App_RCONConnectDelaySeconds = ko.observable("30");
        this.App_RCONConnectRetrySeconds = ko.observable("15");
        this.App_RCONHeartbeatCommand = ko.observable("ping");
        this.App_RCONHeartbeatMinutes = ko.observable("0");
        this.App_TelnetLoginFormat = ko.observable("{0}");
        this.App_SteamUpdateAnonymousLogin = ko.observable("True");
        this.App_SteamForceLoginPrompt = ko.observable("False");
        this.App_SupportsUniversalSleep = ko.observable("False");
        this.App_WakeupMode = ko.observable("Any");
        this.App_MonitorChildProcess = ko.observable("False");
        this.App_MonitorChildProcessWaitMs = ko.observable("1000");
        this.App_MonitorChildProcessName = ko.observable("");
        this.App_Compatibility = ko.observable("None");
//        this.App_AppSettings = ko.observableArray();
        this._App_SteamWorkshopDownloadLocation = ko.observable("");
        this.App_SteamWorkshopDownloadLocation = ko.computed(() => this._App_SteamWorkshopDownloadLocation() != '' ? "{{$FullBaseDir}}" + this._App_SteamWorkshopDownloadLocation() : '');

        this.Console_FilterMatchRegex = ko.observable("");
        this.Console_FilterMatchReplacement = ko.observable("");
        this.Console_ThrowawayMessageRegex = ko.observable("(WARNING|ERROR): Shader.+");
        this._Console_AppReadyRegex = ko.observable("");
        this._Console_UserJoinRegex = ko.observable("");
        this._Console_UserLeaveRegex = ko.observable("");
        this._Console_UserChatRegex = ko.observable("");
        this.Console_UpdateAvailableRegex = ko.observable("^\\[\\d\\d:\\d\\d:\\d\\d\\] \\[INFO\\] A new server update is available! v[\\d\\.]+.$");
        //this.Console_MetricsRegex = ko.observable("");
        this.Console_SuppressLogAtStart = ko.observable("False");
        this.Console_ActivateLogRegex = ko.observable("");
        this.Console_UserActions = ko.observable("{}");

        this.Limits_SleepMode = ko.observable("False");
        this.Limits_SleepOnStart = ko.observable("False");
        this.Limits_SleepDelayMinutes = ko.observable("5");
        this.Limits_DozeDelay = ko.observable("2");
        this.Limits_AutoRetryCount = ko.observable("5");
        this.Limits_SleepStartThresholdSeconds = ko.observable("25");

        this._PortMappings = ko.observableArray(); //of portMappingViewModel
        this.__NewPort = ko.observable("7777");
        this.__NewName = ko.observable("");
        this.__NewDescription = ko.observable("");
        this.__NewPortType = ko.observable("Custom Port");
        this.__NewProtocol = ko.observable("0");

        this._ConfigFileMappings = ko.observableArray(); //of configFileMappingViewModel
        this.__NewConfigFile = ko.observable("");
        this.__NewAutoMap = ko.observable(true);
        this.__NewConfigType = ko.observable("0");

        this._UpdateSourceURL = ko.observable("");
        this._UpdateSourceGitRepo = ko.observable("");
        this._UpdateSourceUnzip = ko.observable(false);
        this._DisplayImageSource = ko.observable("");

        this._SteamServerAppID = ko.observable("");

        this._WinExecutableName = ko.observable("");
        this._LinuxExecutableName = ko.observable("");

        this._AppSettings = ko.observableArray(); //of appSettingViewModel
        this.__AddEditSetting = ko.observable(null); //of appSettingViewModel
        this.__IsEditingSetting = ko.observable(false);

        this._UpdateStages = ko.observableArray(); //of updateStageViewModel
        this.__AddEditStage = ko.observable(null); //of updateStageViewModel
        this.__IsEditingStage = ko.observable(false);

        //Computed values
        this.Console_AppReadyRegex = ko.computed(() => WildcardToRegex(self._Console_AppReadyRegex()));
        this.Console_UserJoinRegex = ko.computed(() => WildcardToRegex(self._Console_UserJoinRegex()));
        this.Console_UserLeaveRegex = ko.computed(() => WildcardToRegex(self._Console_UserLeaveRegex()));
        this.Console_UserChatRegex = ko.computed(() => WildcardToRegex(self._Console_UserChatRegex()));
        this.__QueryPortName = ko.computed(() => {
            var queryPort = self._PortMappings().find(p => p._PortType() == "Steam Query Port");
            return queryPort ? queryPort.Ref() : "";
        });
        this.Meta_EndpointURIFormat = ko.computed(() => self.__QueryPortName() != "" ? `steam://connect/{ip}:{GenericModule.App.Ports.$${self.__QueryPortName()}}` : "");

        this.__SanitizedName = ko.computed(() => self.Meta_DisplayName().replace(/\s+/g, "-").replace(/[^a-z\d-_]/ig, "").toLowerCase());
        this.Meta_OS = ko.computed(() => (self._SupportsWindows() ? 1 : 0) | (self._SupportsLinux() ? 2 : 0));
        this.Meta_ConfigManifest = ko.computed(() => self.__SanitizedName() + "config.json");
        this.Meta_MetaConfigManifest = ko.computed(() => self.__SanitizedName() + "metaconfig.json");
        this._Meta_PortsManifest = ko.computed(() => self.__SanitizedName() + "ports.json");
        this._Meta_StagesManifest = ko.computed(() => self.__SanitizedName() + "updates.json");
        this.Meta_ConfigRoot = ko.computed(() => self.__SanitizedName() + ".kvp");
        this.App_RootDir = ko.computed(() => `./${self.__SanitizedName()}/`);

        this._SteamAppID = ko.computed(() => {
            for (const stage of self._UpdateStages()) {
                if (stage._UpdateSource() == "8" && stage.UpdateSourceData() != "") {
                    return stage.UpdateSourceData();
                }
            }
            return '0';
        });

        this._SteamClientAppID = ko.computed(() => {
            for (const stage of self._UpdateStages()) {
                if (stage._UpdateSource() == "8") {
                    var clientAppID = stage.UpdateSourceArgs() != "" ? stage.UpdateSourceArgs() : stage.UpdateSourceData();
                    if (clientAppID != "") { return clientAppID; }
                }
            }
            return '';
        });

        this.Meta_DisplayImageSource = ko.computed(() => self._SteamClientAppID() == '' ? 'url:' + self._DisplayImageSource() : 'steam:' + self._SteamClientAppID());
        this.App_BaseDirectory = ko.computed(() => self._SteamAppID() == 0 ? self.App_RootDir() + 'serverfiles/' : self.App_RootDir() + self._SteamAppID() + '/');
        this.App_WorkingDir = ko.computed(() => self._SteamAppID() == 0 ? 'serverfiles' : self._SteamAppID());
        this.App_ExecutableWin = ko.computed(() => self.App_WorkingDir() == "" ? self._WinExecutableName() : `${self.App_WorkingDir()}\\${self._WinExecutableName()}`);
        this.App_ExecutableLinux = ko.computed(() => self._compatibility() == "None" ? (self.App_WorkingDir() == "" ? self._LinuxExecutableName() : `${self.App_WorkingDir()}/${self._LinuxExecutableName()}`) : (self._compatibility().substring(self._compatibility().length - 4) == "Xvfb" ? '/usr/bin/xvfb-run' : (self._compatibility() == "Wine" ? '/usr/bin/wine' : '1580130/proton')));
        this._App_LinuxCommandLineArgsCompat = ko.computed(() => self._compatibility() == "None" ? '' : (self._compatibility() == "WineXvfb" ? '-a wine \"./' + self._WinExecutableName() + '\"' : (self._compatibility() == "ProtonXvfb" ? '-a \"{{$FullRootDir}}1580130/proton\" run \"./' + self._WinExecutableName() + '\"' : (self._compatibility() == "Proton" ? 'run \"./' + self._WinExecutableName() + '\"' : '\"./' + self._WinExecutableName() + '\"'))));
        this._App_LinuxCommandLineArgsInput = ko.observable("");
        this.App_LinuxCommandLineArgs = ko.computed(() => (self._App_LinuxCommandLineArgsCompat() != '' ? self._App_LinuxCommandLineArgsCompat() + ' ' + self._App_LinuxCommandLineArgsInput() : self._App_LinuxCommandLineArgsInput()).trim());

        this.App_Ports = ko.computed(() => `@IncludeJson[` + self._Meta_PortsManifest() + `]`);
        this.App_UpdateSources = ko.computed(() => `@IncludeJson[` + self._Meta_StagesManifest() + `]`);
/*
        this.__BuildPortMappings = ko.computed(() => {
            var data = {};
            var allPorts = self._PortMappings();
            var appPortNum = 1;
            self.__QueryPortName("");
            for (var i = 0; i < allPorts.length; i++) {
                var portEntry = allPorts[i];
                if (portEntry.PortType() == "2") //RCON
                {
                    data["RemoteAdminPort"] = portEntry.Port();
                }
                else {
                    if (appPortNum > 3) { continue; }
                    var portName = "ApplicationPort" + appPortNum;
                    data[portName] = portEntry.Port();
                    appPortNum++;
                    if (portEntry.PortType() == "1") //QueryPort
                    {
                        self.__QueryPortName(portName);
                    }
                }
            }
            return data;
        });
*/        
        this.__SampleFormattedArgs = ko.computed(function () {
            return self._AppSettings().filter(s => s.IncludeInCommandLine()).map(s => s.IsFlagArgument() ? s._CheckedValue() : self.App_CommandLineParameterFormat().format(s.ParamFieldName(), s.DefaultValue())).join(self.App_CommandLineParameterDelimiter());
        });
/*
        this.__SampleCommandLineFlags = ko.computed(function () {
            var replacements = ko.toJS(self.__BuildPortMappings());
            replacements["ApplicationIPBinding"] = "0.0.0.0";
            replacements["FormattedArgs"] = self.__SampleFormattedArgs();
            replacements["MaxUsers"] = "10";
            replacements["RemoteAdminPassword"] = "r4nd0m-pa55w0rd-g0e5_h3r3";
            return self.App_CommandLineArgs().template(replacements);
        });
*/
        this.__GenData = ko.computed(function () {
            var data = [
                {
                    "key": "Generated Name",
                    "value": self.__SanitizedName()
                },
                {
                    "key": "Config Root",
                    "value": self.Meta_ConfigRoot()
                },
                {
                    "key": "Settings Manifest",
                    "value": self.Meta_ConfigManifest()
                },
                {
                    "key": "Ports Manifest",
                    "value": self._Meta_PortsManifest()
                },
                {
                    "key": "Config Files Manifest",
                    "value": self.Meta_MetaConfigManifest()
                },
                {
                    "key": "Image Source",
                    "value": self.Meta_DisplayImageSource(),
                    "longValue": true
                },
                {
                    "key": "Root Directory",
                    "value": self.App_RootDir()
                },
                {
                    "key": "Base Directory",
                    "value": self.App_BaseDirectory()
                },
                {
                    "key": "Working Directory",
                    "value": self.App_WorkingDir()
                },
                {
                    "key": "Docker Image",
                    "value": self.Meta_SpecificDockerImage(),
                    "longValue": true
                },
                {
                    "key": "Compatibility",
                    "value": self._compatibility()
                }
            ];

            if (self._SupportsWindows()) {
                data.push({
                    "key": "Windows Executable",
                    "value": self.App_ExecutableWin()
                });
            }

            if (self._SupportsLinux()) {
                data.push({
                    "key": "Linux Executable",
                    "value": self.App_ExecutableLinux()
                });
            }

            return data;
        });

        //Action methods (add/remove/update)
        this.__RemovePort = function (toRemove) {
            if (toRemove._PortType() != 'Custom Port') {
                this._availablePortOptions.push(toRemove._PortType());
            }
            self._PortMappings.remove(toRemove);
        };

        this.__AddPort = function () {
            self._PortMappings.push(new portMappingViewModel(self.__NewPort(), self.__NewName(), self.__NewDescription(), self.__NewPortType(), self.__NewProtocol(), self));
            if (self.__NewPortType() != 'Custom Port'){
                this._availablePortOptions.remove(self.__NewPortType());
            }
        };

        this.__RemoveConfigFile = function (toRemove) {
            self._ConfigFileMappings.remove(toRemove);
        };

        this.__AddConfigFile = function () {
            self._ConfigFileMappings.push(new configFileMappingViewModel(self.__NewConfigFile(), self.__NewAutoMap(), self.__NewConfigType(), self));
        };

        this.__RemoveSetting = function (toRemove) {
            self._AppSettings.remove(toRemove);
        };

        this.__EditSetting = function (toEdit) {
            self.__IsEditingSetting(true);
            self.__AddEditSetting(toEdit);
            $("#addEditSettingModal").modal('show');
        };

        this.__AddSetting = function () {
            self.__IsEditingSetting(false);
            self.__AddEditSetting(new appSettingViewModel(self));
            $("#addEditSettingModal").modal('show');
        };

        this.__DoAddSetting = function () {
            self._AppSettings.push(self.__AddEditSetting());
            $("#addEditSettingModal").modal('hide');
        };

        this.__CloseSetting = function () {
            $("#addEditSettingModal").modal('hide');
        };

        this.__RemoveStage = function (toRemove) {
            self._UpdateStages.remove(toRemove);
        };

        this.__EditStage = function (toEdit) {
            self.__IsEditingStage(true);
            self.__AddEditStage(toEdit);
            $("#addEditStageModal").modal('show');
        };

        this.__AddStage = function () {
            self.__IsEditingStage(false);
            self.__AddEditStage(new updateStageViewModel(self));
            $("#addEditStageModal").modal('show');
        };
        this.__Errors = ko.validation.group(self);
        this.__isValid = ko.computed(function () {
            return self.__Errors().length == 0;
        });
        
        this.__DoAddStage = function () {
            self._UpdateStages.push(self.__AddEditStage());
            $("#addEditStageModal").modal('hide');
        };

        this.__CloseStage = function () {
            $("#addEditStageModal").modal('hide');
        };

        this.__Serialize = function () {
            var asJS = ko.toJS(self);
            var result = JSON.stringify(asJS, omitPrivateMembers);
            return result;
        };

        //Keys that were renamed once it turned out they didn't match the module config - configurations
        //exported before the rename are migrated on import so their values aren't silently dropped.
        this.__RenamedKeys = {
            "App_HasWritableConsole": "App_HasWriteableConsole",
            "Meta_Prerequsites": "Meta_Prerequisites",
            "Console_SleepMode": "Limits_SleepMode",
            "Console_SleepOnStart": "Limits_SleepOnStart",
            "Console_SleepDelayMinutes": "Limits_SleepDelayMinutes",
            "Console_DozeDelay": "Limits_DozeDelay",
            "Console_AutoRetryCount": "Limits_AutoRetryCount",
            "Console_SleepStartThresholdSeconds": "Limits_SleepStartThresholdSeconds"
        };

        this.__Deserialize = function (inputData) {
            var asJS = JSON.parse(inputData);

            for (const [oldKey, newKey] of Object.entries(self.__RenamedKeys)) {
                if (typeof asJS[oldKey] !== "undefined") {
                    if (typeof asJS[newKey] === "undefined") { asJS[newKey] = asJS[oldKey]; }
                    delete asJS[oldKey];
                }
            }

            var ports = asJS._PortMappings || [];
            var configFiles = asJS._ConfigFileMappings || [];
            var settings = asJS._AppSettings || [];
            var stages = asJS._UpdateStages || [];

            delete asJS._PortMappings;
            delete asJS._ConfigFileMappings;
            delete asJS._AppSettings;
            delete asJS._UpdateStages;

            ko.quickmap.map(self, asJS);

            self._PortMappings.removeAll();
            var mappedPorts = ko.quickmap.to(portMappingViewModel, ports, false, { __vm: self });
            self._PortMappings.push.apply(self._PortMappings, mappedPorts);

            self._ConfigFileMappings.removeAll();
            var mappedConfigFiles = ko.quickmap.to(configFileMappingViewModel, configFiles, false, { __vm: self });
            self._ConfigFileMappings.push.apply(self._ConfigFileMappings, mappedConfigFiles);

            self._AppSettings.removeAll();
            //quickmap only maps one level deep, so the enum mappings are held back and turned into view models by hand.
            var mappedSettings = [];
            for (const settingData of settings) {
                var enumMappings = settingData._EnumMappings || [];
                var withoutEnums = Object.assign({}, settingData);
                delete withoutEnums._EnumMappings;

                //Category and Keywords were plain values before they gained a generated fallback, so an
                //older configuration keeps its text by moving it into the backing observable.
                if (typeof withoutEnums.Category !== "undefined" && typeof withoutEnums._Category === "undefined") { withoutEnums._Category = withoutEnums.Category; }
                if (typeof withoutEnums.Keywords !== "undefined" && typeof withoutEnums._Keywords === "undefined") { withoutEnums._Keywords = withoutEnums.Keywords; }

                var mappedSetting = ko.quickmap.to(appSettingViewModel, withoutEnums, false, { __vm: self });
                var mappedEnums = ko.quickmap.to(enumMappingViewModel, enumMappings, false, { __vm: mappedSetting });
                mappedSetting._EnumMappings.push.apply(mappedSetting._EnumMappings, mappedEnums);
                mappedSettings.push(mappedSetting);
            }
            self._AppSettings.push.apply(self._AppSettings, mappedSettings);

            self._UpdateStages.removeAll();
            var mappedStages = ko.quickmap.to(updateStageViewModel, stages, false, { __vm: self });
            self._UpdateStages.push.apply(self._UpdateStages, mappedStages);
        };

        this.__IsExporting = ko.observable(false);

        this.__Export = function () {
            self.__IsExporting(true);
            $("#importexporttextarea").val(self.__Serialize());
            $("#importexporttextarea").attr("readonly", true);
            $("#importExportDialog").modal("show");
            autoSave();
        };

        this.__CopyExportToClipboard = function (data, element) {
            navigator.clipboard.writeText($("#importexporttextarea").val());
            setTimeout(() => $(element.target).tooltip('hide'), 2000);
        };

        this.__CloseImportExport = function () {
            $("#importExportDialog").modal("hide");
        };

        this.__Import = function () {
            self.__IsExporting(false);
            $("#importexporttextarea").val("");
            $("#importexporttextarea").prop("readonly", false);
            $("#importExportDialog").modal("show");
        };

        this.__DoImport = function () {
            self.__Deserialize($("#importexporttextarea").val());
            $("#importExportDialog").modal("hide");
            autoSave();
        };

        this.__Share = function (data, element) {
            var data = encodeURIComponent(self.__Serialize());
            var url = `${document.location.protocol}//${document.location.hostname}${document.location.pathname}#cdata=${data}`;
            navigator.clipboard.writeText(url);
            setTimeout(() => $(element.target).tooltip('hide'), 2000);
        };

        this.__Clear = function () {
            localStorage.configgenautosave = "";
            document.location.reload();
        }

        this.__GithubManifest = function () {
            var githubManifest = JSON.stringify({ id: newGuid(), authors: [self.Meta_Author()], origin: self._Meta_GithubOrigin(), url: self._Meta_GithubURL(), imagefile: "", prefix: self._Meta_Author() }, null, 4);
            return githubManifest;
        }

        this.__DownloadConfig = function () {
            if (this.__ValidationResult() < 2) { return; }

            var values = {};
            for (const key of Object.keys(self).filter(k => !k.startsWith("_"))) {
                values[key.replace("_", ".")] = self[key]();
            }

            var environmentVariables = { "LD_LIBRARY_PATH": "{{$FullBaseDir}}linux64:{{$FullRootDir}}linux64:%LD_LIBRARY_PATH%" };

            if (self._SteamClientAppID() != '') {
                environmentVariables["SteamAppId"] = self._SteamClientAppID();
            }

            if (self._compatibility() == "Proton" || self._compatibility() == "ProtonXvfb") {
                environmentVariables["STEAM_COMPAT_DATA_PATH"] = "{{$FullRootDir}}1580130";
                environmentVariables["STEAM_COMPAT_CLIENT_INSTALL_PATH"] = "{{$FullRootDir}}1580130";
            } else if (self._compatibility() == "Wine" || self._compatibility() == "WineXvfb") {
                environmentVariables["WINEPREFIX"] = "{{$FullRootDir}}.wine";
                environmentVariables["WINEARCH"] = "win64";
                environmentVariables["WINEDEBUG"] = "-all";
            }

            values["App.EnvironmentVariables"] = JSON.stringify(environmentVariables);

            var output = sortByKvpKeyOrder(Object.keys(values)).map(key => `${key}=${values[key]}`).join("\n");
            var asJSAppSettings = self._AppSettings().map(setting => setting.__ToManifestEntry());
            var asJSUpdateStages = ko.toJS(self._UpdateStages());
            var asJSPortMappings = ko.toJS(self._PortMappings());
            var asJSConfigFileMappings = ko.toJS(self._ConfigFileMappings());
            var zip = new JSZip();
            zip.file(self.Meta_ConfigRoot(), output);
            zip.file(self.Meta_ConfigManifest(), JSON.stringify(asJSAppSettings, null, 4));
            for (const stage of asJSUpdateStages) {
                if (stage.ForceDownloadPlatform == null) {
                    delete stage.ForceDownloadPlatform;
                }
                if (stage.UpdateSourceConditionSetting == null) {
                    delete stage.UpdateSourceConditionSetting;
                }
                if (stage.UpdateSourceConditionValue == null) {
                    delete stage.UpdateSourceConditionValue;
                }
                if (stage.UpdateSourceData == "") {
                    delete stage.UpdateSourceData;
                }
                if (stage.UpdateSourceArgs == "") {
                    delete stage.UpdateSourceArgs;
                }
                if (stage.UpdateSourceVersion == "") {
                    delete stage.UpdateSourceVersion;
                }
                if (stage.UpdateSourceTarget == "") {
                    delete stage.UpdateSourceTarget;
                }
            }
            zip.file(self._Meta_StagesManifest(), JSON.stringify(asJSUpdateStages, omitNonPublicMembers, 4));
            zip.file(self._Meta_PortsManifest(), JSON.stringify(asJSPortMappings, omitNonPublicMembers, 4));
            zip.file(self.Meta_MetaConfigManifest(), JSON.stringify(asJSConfigFileMappings, omitNonPublicMembers, 4));
            zip.file("manifest.json", self.__GithubManifest());
            zip.generateAsync({ type: "blob" })
                .then(function (content) {
                    saveAs(content, "configs.zip");
                });
        };

        this.__Invalidate = function (newValue) {
            self.__ValidationResult(0);
        };

        for (const k of Object.keys(self)) {
            if (ko.isObservable(self[k])) {
                self[k].subscribe(self.__Invalidate);
            }
        }

        this.__ValidationResult = ko.observable(0);

        this.__ValidationResults = ko.observableArray();

        this.__ValidateConfig = function () {
            autoSave();
            if (!self.__isValid()) {
                self.__Errors.showAllMessages();
                return;
            }
            self.__ValidationResults.removeAll();

            var failure = (issue, recommendation) => self.__ValidationResults.push(new validationResult("Failure", issue, recommendation));
            var warning = (issue, recommendation, impact) => self.__ValidationResults.push(new validationResult("Warning", issue, recommendation, impact));
            var info = (issue, recommendation, impact) => self.__ValidationResults.push(new validationResult("Info", issue, recommendation, impact));

            //Validation Begins
            if (self.Meta_DisplayName() == "") {
                failure("Missing application name", "Specify an application name under 'Basic Configuration'");
            }

            if (!self._SupportsWindows() && !self._SupportsLinux()) {
                failure("No platforms have been specified as supported.", "Specify at least one supported platform under 'Basic Information'");
            }

            if (self._SupportsWindows()) {
                if (self._WinExecutableName() == "") { failure("Windows is listed as a supported platform, but no executable for this platform was specified.", "Specify an executable for this platform under 'Startup and Shutdown'"); }
                else if (!self._WinExecutableName().toLowerCase().endsWith(".exe")) { failure("You can only start executables (.exe) files on Windows from AMP. Do not attempt to use batch files or other file types.", "Change your Windows Executable under Startup and Shutdown to be a .exe file."); }
            }

            if (self._SupportsLinux()) {
                if (self._LinuxExecutableName() == "" && self._compatibility() == "None") { failure("Linux is listed as a supported platform, but no executable for this platform was specified.", "Specify an executable for this platform under 'Startup and Shutdown'"); }
                else if (self._LinuxExecutableName().toLowerCase().endsWith(".sh")) { failure("You can only start executables files from AMP. Do not attempt to use shell scripts or other file types.", "Change your Linux Executable under Startup and Shutdown to be an actual executable rather than a script."); }
            }

            switch (self.App_AdminMethod()) {
                case "PinballWizard":
                case "AMP_GSIO":
                    break;
                case "STDIO":
                    if (!self.App_HasReadableConsole() && !self.App_HasWriteableConsole()) {
                        failure("Standard IO was selected as the management type, but the console was set as neither readable nor writable - so AMP won't be able to do anything useful.", "Either enable Reading or Writing for the console (if the application supports it) - or change the management mode to 'None'");
                    }
                    break;
                default:
                    if (!self.App_CommandLineArgs().contains("{{$RemoteAdminPassword}}")) {
                        warning("A server management mode is specified that requires AMP to know the password, but {{$RemoteAdminPassword}} is not found within the command line arguments.", "If the application can have it's RCON password specified via the command line then you should add the {{$RemoteAdminPassword}} template item to your command line arguments", "Without the ability to control the RCON password, AMP will not be able to use the servers RCON to provide a console or run commands.");
                    }
/*
                    if (!self.App_CommandLineArgs().contains(this.__QueryPortName())) {
                        warning("A server management mode that uses the network was specified, but the port being used is not found within the command line arguments.", "If the application can have it's RCON port specified via the command line then you should add the {{$" + this.__QueryPortName() + "}} template item to your command line arguments");
                    }

                    if (self._PortMappings().filter(p => p.PortType() == "2").length == 0) {
                        warning("A server management mode that uses the network was specified, but no RCON port has been added.", "Add the port used by this applications RCON under Networking.");
                    }
*/                    break;
            }

            if (self._compatibility() != "None" && !self._SupportsLinux()) { failure("A Linux compatibility layer was chosen, but Linux support is not checked.", "Please check both."); }

            if (self._compatibility() != "None" && self._WinExecutableName() == "") { failure("A Linux compatibility layer was chosen, but no Windows executable was specified to run under it.", "Specify the Windows executable under 'Startup and Shutdown'."); }

            //Validation Summary

            var failures = self.__ValidationResults().filter(r => r.grade == "Failure").length;
            var warnings = self.__ValidationResults().filter(r => r.grade == "Warning").length;

            if (failures > 0) {
                self.__ValidationResult(1);
            }
            else if (warnings > 0) {
                self.__ValidationResult(2);
            }
            else {
                self.__ValidationResult(3);
            }
        };
    }
}
class validationResult {
    constructor(grade, issue, recommendation, impact) {
        this.grade = grade;
        this.issue = issue;
        this.recommendation = recommendation;
        this.impact = impact || "";
        this.gradeClass = "";
        switch (grade) {
            case "Failure": this.gradeClass = "table-danger"; break;
            case "Warning": this.gradeClass = "table-warning"; break;
            case "Info": this.gradeClass = "table-info"; break;
        }
    }
}

class portMappingViewModel {
    constructor(port = "", portName = "", portDescription = "", portType = "Custom Port", protocol = "0", vm = null) {
        var self = this;
        this.__vm = vm;
        this._Protocol = ko.observable(protocol);
        this.Protocol = ko.computed(() => self._Protocol() == "0" ? `Both` : (self._Protocol() == "1" ? `TCP` : `UDP`));
        this.Port = ko.observable(port);
        this._PortType = ko.observable(portType);
        this._Name = ko.observable(portName);
        this.Name = ko.computed(() => self._PortType() == "Custom Port" ? self._Name() : (self._PortType() == "Steam Query Port" ? `Steam Query Port` : (self._PortType() == "RCON Port" ? `Remote Admin Port` : `Main Game Port`)));
        this._Description = ko.observable(portDescription);
        this.Description = ko.computed(() => self._PortType() == "Custom Port" ? self._Description() : (self._PortType() == "Steam Query Port" ? `Port used for Steam queries and server list` : (self._PortType() == "RCON Port" ? `Port used for RCON administration` : `Port used for main game traffic`)));
        this.Ref = ko.computed(() => self._PortType() == "Custom Port" ? self._Name().replace(/\s+/g, "").replace(/[^a-z\d-_]/ig, "") : (self._PortType() == "Steam Query Port" ? `SteamQueryPort` : (self._PortType() == "RCON Port" ? `RemoteAdminPort` : `MainGamePort`)));
        this.__RemovePort = () => self.__vm.__RemovePort(self);
    }
}

class configFileMappingViewModel {
    constructor(configFile = "", autoMap = true, configType = "0", vm = null) {
        var self = this;
        this.__vm = vm;
        this.ConfigFile = ko.observable(configFile);
        this._ConfigType = ko.observable(configType);
        this.ConfigType = ko.computed(() => self._ConfigType() == "0" ? `json` : (self._ConfigType() == "1" ? `ini` : (self._ConfigType() == "2" ? `xml` : (self._ConfigType() == "3" ? `kvp` : `auto`))));
        this._AutoMap = ko.observable(autoMap);
        this.AutoMap = ko.computed(() => self._ConfigType() == "4" ? false : self._AutoMap());
        this.__RemoveConfigFile = () => self.__vm.__RemoveConfigFile(self);
    }
}

class appSettingViewModel {
    constructor(vm) {
        var self = this;
        this.__vm = vm;
        this.DisplayName = ko.observable("");
        //Categories and subcategories are "Name:icon" in the templates (subcategories usually carry a
        //":order" too), so an empty category falls back to the applications own name.
        this._Category = ko.observable("");
        this.Category = ko.computed(() => {
            if (self._Category() != "") { return self._Category(); }
            //__vm is attached after the data is mapped when a saved configuration is loaded, so fall back
            //to the generator view model itself rather than caching a category without the app name in it.
            //globalThis, because the constructors 'vm' parameter shadows the global one.
            var owner = self.__vm || globalThis.vm;
            return ((owner ? owner.Meta_DisplayName() : "") || "Server Settings") + ":stadia_controller";
        });
        this.Subcategory = ko.observable("Server:dns:1");
        this.Description = ko.observable("");
        this._Keywords = ko.observable("");
        this.Keywords = ko.computed(() => self._Keywords() != "" ? self._Keywords() : self.DisplayName().toLowerCase().replaceAll(" ", ","));
        this.FieldName = ko.observable("");
        this.InputType = ko.observable("text")
        this.MinValue = ko.observable("");
        this.MaxValue = ko.observable("");
        this.IsFlagArgument = ko.observable(false);
        this.ParamFieldName = ko.computed(() => self.FieldName());
        this.IncludeInCommandLine = ko.observable(false);
        this.DefaultValue = ko.observable("");
        this.Placeholder = ko.observable("");
        this.Suffix = ko.observable("");
        this.Hidden = ko.observable(false);
        this.SkipIfEmpty = ko.observable(false);
        this._CheckedValue = ko.observable("true");
        this._UncheckedValue = ko.observable("false");
        this.__RemoveSetting = () => self.__vm.__RemoveSetting(self);
        this.__EditSetting = () => self.__vm.__EditSetting(self);

        this._EnumMappings = ko.observableArray(); //of enumMappingViewModel
        this.__NewEnumKey = ko.observable("");
        this.__NewEnumValue = ko.observable("");

        this.__RemoveEnum = function (toRemove) {
            self._EnumMappings.remove(toRemove);
        };

        this.__AddEnum = function () {
            self._EnumMappings.push(new enumMappingViewModel(self.__NewEnumKey(), self.__NewEnumValue(), self));
        };

        this.__Deserialize = function (inputData) {
            var asJS = JSON.parse(inputData);
            var enumSettings = asJS._EnumMappings;

            delete asJS._EnumMappings;

            ko.quickmap.map(self, asJS);

            self._EnumMappings.removeAll();
            var mappedEnums = ko.quickmap.to(enumMappingViewModel, enumSettings, false, { __vm: self });
            self._EnumMappings.push.apply(self._EnumMappings, mappedEnums);
        };

        this.EnumValues = ko.computed(() => {
            if (self.InputType() == "checkbox") {
                //Checkboxes are keyed on the state ("False"/"True"), with the value being what gets written
                //out - the same way AMP fills these in itself and how the templates are written.
                var result = {};
                result["False"] = self._UncheckedValue();
                result["True"] = self._CheckedValue();
                return result;
            } else if (self.InputType() == "enum") {
                var result = {};
                for (const enumMapping of self._EnumMappings()) {
                    result[ko.unwrap(enumMapping._enumKey)] = ko.unwrap(enumMapping._enumValue);
                }
                return result;
            } else {
                return {};
            }
        });

        //Builds the entry as it appears in <name>config.json. Key order and which keys are present at all
        //follow what the existing templates do: the optional ones are only written when they actually say
        //something (AMP defaults them to false/empty anyway).
        this.__ToManifestEntry = function () {
            var entry = {
                DisplayName: self.DisplayName(),
                Category: self.Category(),
                Subcategory: self.Subcategory(),
                Description: self.Description(),
                Keywords: self.Keywords(),
                FieldName: self.FieldName(),
                InputType: self.InputType()
            };

            if (self.InputType() == "number") {
                if (self.MinValue() != "") { entry.MinValue = self.MinValue(); }
                if (self.MaxValue() != "") { entry.MaxValue = self.MaxValue(); }
            }

            if (self.IsFlagArgument()) { entry.IsFlagArgument = true; }
            if (self.Hidden()) { entry.Hidden = true; }

            entry.ParamFieldName = self.ParamFieldName();

            if (self.IncludeInCommandLine()) { entry.IncludeInCommandLine = true; }
            if (self.SkipIfEmpty()) { entry.SkipIfEmpty = true; }

            entry.DefaultValue = self.DefaultValue();

            if (self.Placeholder() != "") { entry.Placeholder = self.Placeholder(); }
            if (self.Suffix() != "") { entry.Suffix = self.Suffix(); }

            entry.EnumValues = self.EnumValues();

            return entry;
        };
    }
}

class enumMappingViewModel {
    constructor(enumKey = "", enumValue = "", vm = null) {
        var self = this;
        this.__vm = vm;
        this._enumKey = ko.observable(enumKey);
        this._enumValue = ko.observable(enumValue);
        this.__RemoveEnum = () => self.__vm.__RemoveEnum(self);
    }
}

class updateStageViewModel {
    constructor(vm) {
        var self = this;
        this.__vm = vm;
        this.UpdateStageName = ko.observable("");
        this._UpdateSourcePlatform = ko.observable("0");
        this.UpdateSourcePlatform = ko.computed(() => self._UpdateSourcePlatform() == "0" ? `All` : (self._UpdateSourcePlatform() == "1" ? `Linux` : `Windows`));
        this._UpdateSource = ko.observable("8");
        this.UpdateSource = ko.computed(() => self._UpdateSource() == "0" ? `CopyFilePath` : (self._UpdateSource() == "1" ? `CreateSymlink` : (self._UpdateSource() == "2" ? `Executable` : (self._UpdateSource() == "3" ? `ExtractArchive` : (self._UpdateSource() == "4" ? `FetchURL` : (self._UpdateSource() == "5" ? `GithubRelease` : (self._UpdateSource() == "6" ? `SetExecutableFlag` : (self._UpdateSource() == "7" ? `StartApplication` : `SteamCMD`))))))));
        this.UpdateSourceData = ko.observable("");
        this.UpdateSourceArgs = ko.observable("");
        this.UpdateSourceVersion = ko.observable("");
        this.UpdateSourceTarget = ko.observable("");
        this.UnzipUpdateSource = ko.observable(false);
        this.OverwriteExistingFiles = ko.observable(false);
        this._ForceDownloadPlatform = ko.observable(null);
        this.ForceDownloadPlatform = ko.computed(() => self._ForceDownloadPlatform() == "1" ? `Linux` : (self._ForceDownloadPlatform() == "2" ? `Windows` : null));
        this.UpdateSourceConditionSetting = ko.observable(null);
        this.UpdateSourceConditionValue = ko.observable(null);
        this.DeleteAfterExtract = ko.observable(true);
        this.OneShot = ko.observable(false);
        this.__RemoveStage = () => self.__vm.__RemoveStage(self);
        this.__EditStage = () => self.__vm.__EditStage(self);
    }
}

var vm = new generatorViewModel();

function autoSave() {
    localStorage.configgenautosave = vm.__Serialize();
}

function autoLoad() {
    if (!localStorage.configgenautosave) { return; }
    try {
        vm.__Deserialize(localStorage.configgenautosave);
    }
    catch (e) {
        console.error("Could not load the autosaved configuration - starting from a blank one.", e);
        localStorage.configgenautosave = "";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    ko.applyBindings(vm);
    setInterval(autoSave, 30000);
    $('body').scrollspy({ target: '#navbar', offset: 90 });

    $('[data-toggle="tooltip"]').tooltip({
        container: 'body',
        trigger: 'click',
        placement: 'bottom'
    });
    //Check if there is anything after the # and if it starts cdata=, then import it if it does.
    if (document.location.hash.indexOf("#cdata=") == 0) {
        var data = decodeURIComponent(document.location.hash.substring(7));
        vm.__Deserialize(data);
        document.location.hash = "";
    }
    else {
        autoLoad();
    }
});
