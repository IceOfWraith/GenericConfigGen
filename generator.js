function omitNonPublicMembers(key, value)
{
    return (key.indexOf("_") === 0) ? undefined : value;
}

function omitPrivateMembers(key, value)
{
    return (key.indexOf("__") === 0) ? undefined : value;
}

function downloadString(data, filename)
{
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

class generatorViewModel {
    constructor() {
        var self = this;
<<<<<<< Updated upstream

        this.Meta_DisplayName = ko.observable("");
=======
        this._availablePortOptions = ko.observableArray(['Custom Port', 'Main Game Port', 'Steam Query Port', 'RCON Port']);
        this._compatibility = ko.observable("None");
        this.Meta_DisplayName = ko.observable("").extend({ required: true });
>>>>>>> Stashed changes
        this.Meta_Description = ko.observable("");
        this.Meta_Author = ko.observable("");
        this.Meta_URL = ko.observable("");

        this._SupportsWindows = ko.observable(true);
        this._SupportsLinux = ko.observable(true);

        this.App_AdminMethod = ko.observable("STDIO");
        this.App_HasReadableConsole = ko.observable(true);
        this.App_HasWritableConsole = ko.observable(true);
        this.App_DisplayName = ko.computed(() => this.Meta_DisplayName());

        this.App_CommandLineArgs = ko.observable("+ip {{$ApplicationIPBinding}} +port {{$ApplicationPort1}} +queryport {{$ApplicationPort2}} +rconpassword \"{{$RemoteAdminPassword}}\" +maxusers {{$MaxUsers}} {{$FormattedArgs}}")
        this.App_CommandLineParameterFormat = ko.observable("-{0} \"{1}\"");
        this.App_CommandLineParameterDelimiter = ko.observable(" ");

        this.App_RapidStartup = ko.observable("false");
        this.App_ApplicationReadyMode = ko.observable("Immediate");
        this.App_ExitMethod = ko.observable("String");
        this.App_ExitString = ko.observable("stop");

        this.Console_ThrowawayMessageRegex = ko.observable("^(WARNING|ERROR): Shader.+$");
        this.Console_AppReadyRegex = ko.observable("^Server is ready.$");
        this.Console_UserJoinRegex = ko.observable("^User (?<username>.+?) \\((?<userid>-?\d+)\\) connected from \\[::ffff:(?<endpoint>.+?)\\]$");
        this.Console_UserLeaveRegex = ko.observable("^User (?<username>.+?) \\((?<userid>-?\d+)\\) disconnected\\. Reason: (.+?)$");
        this.Console_UserChatRegex = ko.observable("^(?<username>.+?): (?<message>.+)$");

        this._PortMappings = ko.observableArray(); //of portMappingViewModel
        this.__NewPort = ko.observable("7777");
        this.__NewPortType = ko.observable("0");

        this._UpdateSourceType = ko.observable("4");
        this._UpdateSourceURL = ko.observable("");
        this._UpdateSourceGitRepo = ko.observable("");
        this._UpdateSourceUnzip = ko.observable(false);
        this._DisplayImageSource = ko.observable("");

        this._SteamServerAppID = ko.observable("");
        this._SteamClientAppID = ko.observable("");

        this._WinExecutableName = ko.observable("");
        this._LinuxExecutableName = ko.observable("");

        this._AppSettings = ko.observableArray(); //of appSettingViewModel
        this.__AddEditSetting = ko.observable(null); //of appSettingViewModel
        this.__IsEditingSetting = ko.observable(false);

        //Computed values
        this.__SanitizedName = ko.computed(() => self.Meta_DisplayName().replace(/\s+/g, "-").replace(/[^a-z\d-_]/ig, "").toLowerCase());
        this.Meta_OS = ko.computed(() => (self._SupportsWindows() ? 1 : 0) | (self._SupportsLinux() ? 2 : 0));
        this.Meta_ConfigManifest = ko.computed(() => self.__SanitizedName() + "config.json");
        this.Meta_ConfigRoot = ko.computed(() => self.__SanitizedName() + ".kvp");
        this.Meta_DisplayImageSource = ko.computed(() => self._UpdateSourceType() == "4" ? "steam:" + self._SteamClientAppID() : "url:" + self._DisplayImageSource());

        this.App_RootDir = ko.computed(() => `./${self.__SanitizedName()}/`);
        this.App_BaseDirectory = ko.computed(() => self._UpdateSourceType() == "4" ? `./${self.__SanitizedName()}/${self._SteamServerAppID()}/` : `./${self.__SanitizedName()}/`);
        this.App_WorkingDir = ko.computed(() => self._UpdateSourceType() == "4" ? self._SteamServerAppID() : "");

        this.App_ExecutableWin = ko.computed(() => self.App_WorkingDir() == "" ? self._WinExecutableName() : `${self.App_WorkingDir()}\\${self._WinExecutableName()}`);
        this.App_ExecutableLinux = ko.computed(() => self.App_WorkingDir() == "" ? self._LinuxExecutableName() : `${self.App_WorkingDir()}/${self._LinuxExecutableName()}`);

        this.__QueryPortName = ko.observable("");
        this.Meta_EndpointURIFormat = ko.computed(() => self.__QueryPortName() != "" ? `steam://connect/{ip}:{GenericModule.App.${self.__QueryPortName()}}` : "");

        this.__BuildPortMappings = ko.computed(() => {
            var data = {};
            var allPorts = self._PortMappings();
            var appPortNum = 1;
            self.__QueryPortName("");
            for (var i = 0; i < allPorts.length; i++)
            {
                var portEntry = allPorts[i];
                if (portEntry.PortType() == "2") //RCON
                {
                    data["RemoteAdminPort"] = portEntry.Port();
                }
                else
                {
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

        this.__SampleFormattedArgs = ko.computed(function(){
            return self._AppSettings().filter(s => s.IncludeInCommandLine()).map(s => s.IsFlagArgument() ? s._CheckedValue() : self.App_CommandLineParameterFormat().format(s.ParamFieldName(), s.DefaultValue())).join(self.App_CommandLineParameterDelimiter());
        });

        this.__SampleCommandLineFlags = ko.computed(function(){
            var replacements = ko.toJS(self.__BuildPortMappings());
            replacements["ApplicationIPBinding"] = "0.0.0.0";
            replacements["FormattedArgs"] = self.__SampleFormattedArgs();
            replacements["MaxUsers"] = "10";
            replacements["RemoteAdminPassword"] = "r4nd0m-pa55w0rd-g0e5_h3r3";
            return self.App_CommandLineArgs().template(replacements);
        });

        this.__GenData = ko.computed(function () {
            var data = [
                {
                    "key": "Generated Name",
                    "value": self.__SanitizedName(),
                },
                {
                    "key": "Config Root",
                    "value": self.Meta_ConfigRoot()
                },
                {
                    "key": "Manifest Filename",
                    "value": self.Meta_ConfigManifest()
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
                    "key": "Endpoint URI Format",
                    "value": self.Meta_EndpointURIFormat(),
                    "longValue": true
                }
            ];

            if (self._SupportsWindows()){
                data.push({
                    "key": "Windows Executable",
                    "value": self.App_ExecutableWin()
                });
            }

            if (self._SupportsLinux()){
                data.push({
                    "key": "Linux Executable",
                    "value": self.App_ExecutableLinux()
                });
            }

            return data;
        });

        //Action methods (add/remove/update)
        this.__RemovePort = function(toRemove){
            self._PortMappings.remove(toRemove);
        };

        this.__AddPort = function(){
            self._PortMappings.push(new portMappingViewModel(self.__NewPort(), self.__NewPortType(), self));
        };

        this.__RemoveSetting = function(toRemove){
            self._AppSettings.remove(toRemove);
        };

        this.__EditSetting = function(toEdit){
            self.__IsEditingSetting(true);
            self.__AddEditSetting(toEdit);
            $("#addEditSettingModal").modal('show');
        };

        this.__AddSetting = function(){
            self.__IsEditingSetting(false);
            self.__AddEditSetting(new appSettingViewModel(self));
            $("#addEditSettingModal").modal('show');
        };

        this.__DoAddSetting = function (){
            self._AppSettings.push(self.__AddEditSetting());
            $("#addEditSettingModal").modal('hide');
        };

        this.__CloseSetting = function() {
            $("#addEditSettingModal").modal('hide');
        };

<<<<<<< Updated upstream
        this.__Serialize = function() {
=======
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
        this.Errors = ko.validation.group(self);
        this.isValid = ko.computed(function () {
            return self.Errors().length == 0;
        });
        this.ErrorsUpdates = ko.validation.group(updateStageViewModel);
        this.isValid = ko.computed(function () {
            return self.ErrorsUpdates().length == 0;
        });
        
        this.__DoAddStage = function () {
            if (self.ErrorsUpdates().length === 0) {
                self._UpdateStages.push(self.__AddEditStage());
                $("#addEditStageModal").modal('hide');
            } else {
                alert('Please check your submission.');
                self.ErrorsUpdates.showAllMessages();

            }
        };

        this.__CloseStage = function () {
            $("#addEditStageModal").modal('hide');
        };

        this.__Serialize = function () {
>>>>>>> Stashed changes
            var asJS = ko.toJS(self);
            var result = JSON.stringify(asJS, omitPrivateMembers);
            return result;
        };

        this.__Deserialize = function(inputData) {
            var asJS = JSON.parse(inputData);
            var ports = asJS._PortMappings;
            var settings = asJS._AppSettings;

            delete asJS._PortMappings;
            delete asJS._AppSettings;

            ko.quickmap.map(self, asJS);
            
            self._PortMappings.removeAll();
            var mappedPorts = ko.quickmap.to(portMappingViewModel, ports, false, {__vm: self});
            self._PortMappings.push.apply(self._PortMappings, mappedPorts);

            self._AppSettings.removeAll();
            var mappedPorts = ko.quickmap.to(appSettingViewModel, settings, false, {__vm: self});
            self._AppSettings.push.apply(self._AppSettings, mappedPorts);
        };

        this.__IsExporting = ko.observable(false);

        this.__Export = function() {
            self.__IsExporting(true);
            $("#importexporttextarea").val(self.__Serialize());
            $("#importexporttextarea").attr("readonly", true);
            $("#importExportDialog").modal("show");
            autoSave();
        };

        this.__CopyExportToClipboard = function(data, element) {
            navigator.clipboard.writeText($("#importexporttextarea").val());
            setTimeout(() => $(element.target).tooltip('hide'), 2000);
        };

        this.__CloseImportExport = function() {
            $("#importExportDialog").modal("hide");
        };

        this.__Import = function() {
            self.__IsExporting(false);
            $("#importexporttextarea").val("");
            $("#importexporttextarea").prop("readonly", false);
            $("#importExportDialog").modal("show");
        };

        this.__DoImport = function() {
            self.__Deserialize($("#importexporttextarea").val());
            $("#importExportDialog").modal("hide");
            autoSave();
        };

        this.__Share = function(data, element) {
            var data = encodeURIComponent(self.__Serialize());
            var url = `${document.location.protocol}//${document.location.hostname}${document.location.pathname}#cdata=${data}`;
            navigator.clipboard.writeText(url);
            setTimeout(() => $(element.target).tooltip('hide'), 2000);
        };

        this.__Clear = function(){
            localStorage.configgenautosave = "";
            document.location.reload();
        }

        this.__DownloadConfig = function(){
            if (this.__ValidationResult() < 2) { return; }

            var lines = [];
            for (const key of Object.keys(self).filter(k => !k.startsWith("_")))
            {
                lines.push(`${key.replace("_", ".")}=${self[key]()}`);
            }

            switch (self._UpdateSourceType())
            {
                case "1": //URL
                    lines.push(`App.UpdateSources=[{\"UpdateStageName\": \"Server Download\",\"UpdateSourcePlatform\": \"All\", \"UpdateSource\": \"FetchURL\", \"UpdateSourceData\": \"${self._UpdateSourceURL()}\", \"UnzipUpdateSource\": ${self._UpdateSourceUnzip()}}]`);
                    break;
                case "4": //Steam
                    lines.push(`App.UpdateSources=[{\"UpdateStageName\": \"SteamCMD Download\",\"UpdateSourcePlatform\": \"All\", \"UpdateSource\": \"SteamCMD\", \"UpdateSourceData\": \"${self._SteamServerAppID()}\"}]`);
                    break;
                case "16": //Github
                    lines.push(`App.UpdateSources=[{\"UpdateStageName\": \"GitHub Release Download\",\"UpdateSourcePlatform\": \"All\", \"UpdateSource\": \"GithubRelease\", \"UpdateSourceData\": \"${self._UpdateSourceGitRepo()}\"}]`);
                    break;
            }

            if (self._UpdateSourceType() == "4") //SteamCMD
            {
                lines.push(`App.EnvironmentVariables={\"LD_LIBRARY_PATH\": \"./linux64:%LD_LIBRARY_PATH%\", \"SteamAppId\": \"${self._SteamClientAppID()}\"}`);
            }

            var portMappings = self.__BuildPortMappings();
            for (const key of Object.keys(portMappings))
            {
                lines.push(`App.${key}=${portMappings[key]}`);
            }

            var output = lines.sort().join("\n");
            downloadString(output, self.Meta_ConfigRoot());
        };

        this.__DownloadSettingsManifest = function(){
            if (this.__ValidationResult() < 2) { return; }

            var asJS = ko.toJS(self._AppSettings());
            downloadString(JSON.stringify(asJS, omitNonPublicMembers, 4), self.Meta_ConfigManifest());
        };

        this.__Invalidate = function(newValue){ 
            self.__ValidationResult(0);
        };

        for (const k of Object.keys(self))
        {
            if (ko.isObservable(self[k]))
            {
                self[k].subscribe(self.__Invalidate);
            }
        }

        this.__ValidationResult = ko.observable(0);

        this.__ValidationResults = ko.observableArray();
<<<<<<< Updated upstream

        this.__ValidateConfig = function(){
            autoSave();
            self.__ValidationResults.removeAll();

            var failure = (issue, recommendation) => self.__ValidationResults.push(new validationResult("Failure", issue, recommendation));
            var warning = (issue, recommendation, impact) => self.__ValidationResults.push(new validationResult("Warning", issue, recommendation, impact));
            var info = (issue, recommendation, impact) => self.__ValidationResults.push(new validationResult("Info", issue, recommendation, impact));

            //Validation Begins
            if (self.Meta_DisplayName() == ""){
                failure("Missing application name", "Specify an application name under 'Basic Configuration'");
            }

            if (!self._SupportsWindows() && !self._SupportsLinux())
            {
                failure("No platforms have been specified as supported.", "Specify at least one supported platform under 'Basic Information'");
            }

            if (self._SupportsWindows())
            {
                if (self._WinExecutableName() == "") { failure("Windows is listed as a supported platform, but no executable for this platform was specified.", "Specify an executable for this platform under 'Startup and Shutdown'"); }
                else if (!self._WinExecutableName().toLowerCase().endsWith(".exe")) { failure("You can only start executables (.exe) files on Windows from AMP. Do not attempt to use batch files or other file types.", "Change your Windows Executable under Startup and Shutdown to be a .exe file."); }
            }

            if (self._SupportsLinux())
            {
                if (self._LinuxExecutableName() == "") { failure("Linux is listed as a supported platform, but no executable for this platform was specified.", "Specify an executable for this platform under 'Startup and Shutdown'"); }
                else if (self._LinuxExecutableName().toLowerCase().endsWith(".sh")) { failure("You can only start executables files from AMP. Do not attempt to use shell scripts or other file types.", "Change your Linux Executable under Startup and Shutdown to be an actual executable rather than a script."); }
            }

            switch (self.App_AdminMethod())
            {
                case "PinballWizard": 
                case "AMP_GSIO":
                    break;
                case "STDIO":
                    if (!self.App_HasReadableConsole() && !self.App_HasWritableConsole())
                    {
                        failure("Standard IO was selected as the management type, but the console was set as neither readable nor writable - so AMP won't be able to do anything useful.", "Either enable Reading or Writing for the console (if the application supports it) - or change the management mode to 'None'");
                    }
                    break;
                default:
                    if (!self.App_CommandLineArgs().contains("{{$RemoteAdminPassword}}")){
                        warning("A server management mode is specified that requires AMP to know the password, but {{$RemoteAdminPassword}} is not found within the command line arguments.", "If the application can have it's RCON password specified via the command line then you should add the {{$RemoteAdminPassword}} template item to your command line arguments", "Without the ability to control the RCON password, AMP will not be able to use the servers RCON to provide a console or run commands.");
                    }

                    if (!self.App_CommandLineArgs().contains(this.__QueryPortName())){
                        warning("A server management mode that uses the network was specified, but the port being used is not found within the command line arguments.", "If the application can have it's RCON port specified via the command line then you should add the {{$" + this.__QueryPortName() + "}} template item to your command line arguments");
                    }

                    if (self._PortMappings().filter(p => p.PortType() == "2").length == 0)
                    {
                        warning("A server management mode that uses the network was specified, but no RCON port has been added.", "Add the port used by this applications RCON under Networking.");
                    }
                    break;
            }

            switch (self._UpdateSourceType())
            {
                case "1": //Fetch from URL
                    if (self._UpdateSourceURL() == "") {
                        failure("Update method is Fetch from URL, but no download URL was specified.", "Specify the 'Update source URL' under Update Sources.");
                    }
                    else if (self._UpdateSourceURL().toLowerCase().endsWith(".zip") && !self._UpdateSourceUnzip())
                    {
                        info("Download URL is a zip file, but 'Unzip once downloaded' is not turned on.", "Turn on 'Unzip once downloaded' under 'Update Sources'", "Without this setting turned on, the archive will not be extracted. If this was intentional, you can ignore this message.");
                    }
                    break;
                case "4": //SteamCMD
                    if (self._SteamServerAppID() == "") { 
                        failure("Update method is SteamCMD, but no server App ID is set.", "Specify the 'Server Steam App ID' under Update Sources.");
                    }
                    if (self._SteamClientAppID() == "") { 
                        warning("Update method is SteamCMD, but no client App ID is set.", "Specify the 'Server Client App ID' under Update Sources.", "The client app ID is used to source the background image for the resulting instance.");
                    }
                    break;
            }

            if (self.Console_AppReadyRegex() != "" && !self.Console_AppReadyRegex().match(/\^.+\$/)) { failure("Server ready expression does not match the entire line. Regular expressions for AMP must match the entire line, starting with a ^ and ending with a $.", "Update the Server Ready expression under Server Events to match the entire line."); }
            if (self.Console_UserJoinRegex() != "" && !self.Console_UserJoinRegex().match(/\^.+\$/)) { failure("User connected expression does not match the entire line. Regular expressions for AMP must match the entire line, starting with a ^ and ending with a $.", "Update the User connected expression under Server Events to match the entire line."); }
            if (self.Console_UserLeaveRegex() != "" && !self.Console_UserLeaveRegex().match(/\^.+\$/)) { failure("User disconnected expression does not match the entire line. Regular expressions for AMP must match the entire line, starting with a ^ and ending with a $.", "Update the User disconnected expression under Server Events to match the entire line."); }
            if (self.Console_UserChatRegex() != "" && !self.Console_UserChatRegex().match(/\^.+\$/)) { failure("User chat expression does not match the entire line. Regular expressions for AMP must match the entire line, starting with a ^ and ending with a $.", "Update the User chat expression under Server Events to match the entire line."); }
=======
        self.errors = ko.validation.group(self);
        this.__ValidateConfig = function () {
            autoSave();
            self.__ValidationResults.removeAll();
            if (self.errors().length === 0) {
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
                    if (self._LinuxExecutableName() == "") { failure("Linux is listed as a supported platform, but no executable for this platform was specified.", "Specify an executable for this platform under 'Startup and Shutdown'"); }
                    else if (self._LinuxExecutableName().toLowerCase().endsWith(".sh")) { failure("You can only start executables files from AMP. Do not attempt to use shell scripts or other file types.", "Change your Linux Executable under Startup and Shutdown to be an actual executable rather than a script."); }
                }
    
                switch (self.App_AdminMethod()) {
                    case "PinballWizard":
                    case "AMP_GSIO":
                        break;
                    case "STDIO":
                        if (!self.App_HasReadableConsole() && !self.App_HasWritableConsole()) {
                            failure("Standard IO was selected as the management type, but the console was set as neither readable nor writable - so AMP won't be able to do anything useful.", "Either enable Reading or Writing for the console (if the application supports it) - or change the management mode to 'None'");
                        }
                        break;
                    default:
                        if (!self.App_CommandLineArgs().contains("{{$RemoteAdminPassword}}")) {
                            warning("A server management mode is specified that requires AMP to know the password, but {{$RemoteAdminPassword}} is not found within the command line arguments.", "If the application can have it's RCON password specified via the command line then you should add the {{$RemoteAdminPassword}} template item to your command line arguments", "Without the ability to control the RCON password, AMP will not be able to use the servers RCON to provide a console or run commands.");
                        }
                        break;
                }
    
                if ((self._compatibility() == "Wine" && !self._SupportsLinux()) || (self._compatibility() == "Proton" && !self._SupportsLinux())) { failure("A Linux compatibility layer was chosen, but Linux support is not checked.", "Please check both."); }
>>>>>>> Stashed changes

            //Validation Summary

            var failures = self.__ValidationResults().filter(r => r.grade == "Failure").length;
            var warnings = self.__ValidationResults().filter(r => r.grade == "Warning").length;

            if (failures > 0)
            {
                self.__ValidationResult(1);
            }
            else if (warnings > 0)
            {
                self.__ValidationResult(2);
            }
            else
            {
                self.__ValidationResult(3);
            }
            } else{
                alert('Please check your submission.');
                self.errors.showAllMessages();
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
        switch (grade)
        {
            case "Failure": this.gradeClass = "table-danger"; break;
            case "Warning": this.gradeClass = "table-warning"; break;
            case "Info": this.gradeClass = "table-info"; break;
        }
    }
}

class portMappingViewModel {
    constructor(port, portType, vm) {
        var self = this;
        this.__vm = vm;
        this.Port = ko.observable(port);
        this.PortType = ko.observable(portType);
        this.__RemovePort = () => self.__vm.__RemovePort(self);
    }
}

class appSettingViewModel {
    constructor(vm) {
        var self = this;
        this.__vm = vm;
        this.DisplayName = ko.observable("");
        this.Category = ko.observable("");
        this.Description = ko.observable("");
        this.Keywords = ko.observable("");
        this.FieldName = ko.observable("");
        this.InputType = ko.observable("text")
        this.IsFlagArgument = ko.observable(false);
        this.ParamFieldName = ko.computed(() => self.FieldName());
        this.IncludeInCommandLine = ko.observable(true);
        this.DefaultValue = ko.observable("");
        this._CheckedValue = ko.observable("true");
        this._UncheckedValue = ko.observable("false");
        this.EnumValues = ko.computed(() => {
            if (self.InputType() != "checkbox") { return {}; }
            var result = {};
            result[self._CheckedValue()] = "True";
            result[self._UncheckedValue()] = "False";
            return result;
        });
        this.__RemoveSetting = () => self.__vm.__RemoveSetting(self);
        this.__EditSetting = () => self.__vm.__EditSetting(self);
<<<<<<< Updated upstream
=======

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
                var result = {};
                result[self._CheckedValue()] = "True";
                result[self._UncheckedValue()] = "False";
                return result;
            } else if (self.InputType() == "enum") {
                var result = {};
                for (let i = 0; i < self._EnumMappings().length; i++) {
                    result[self._EnumMappings()[i]._enumKey()] = self._EnumMappings()[i]._enumValue();
                }
                return result;
            } else {
                return {};
            }
        });
    }
}

class enumMappingViewModel {
    constructor(enumKey, enumValue, vm) {
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
        this.UpdateStageName = ko.observable("").extend({ required: true });
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
        this.ForceDownloadPlatform = ko.computed(() => self._ForceDownloadPlatform() == "0" ? null : (self._ForceDownloadPlatform() == "1" ? `Linux` : `Windows`));
        this.UpdateSourceConditionSetting = ko.observable(null);
        this.UpdateSourceConditionValue = ko.observable(null);
        this.DeleteAfterExtract = ko.observable(true);
        this.OneShot = ko.observable(false);
        this.__RemoveStage = () => self.__vm.__RemoveStage(self);
        this.__EditStage = () => self.__vm.__EditStage(self);
>>>>>>> Stashed changes
    }
}

var vm = new generatorViewModel();

function autoSave() {
    localStorage.configgenautosave = vm.__Serialize();
}

function autoLoad(){
    if (localStorage.configgenautosave != ""){
        vm.__Deserialize(localStorage.configgenautosave);
    }
}

document.addEventListener('DOMContentLoaded',() => {
    ko.applyBindings(vm);
    setInterval(autoSave, 30000);
    $('body').scrollspy({ target: '#navbar', offset: 90 });

    $('[data-toggle="tooltip"]').tooltip({
        container: 'body',
        trigger: 'click',
        placement: 'bottom'
    });
    //Check if there is anything after the # and if it starts cdata=, then import it if it does.
    if (document.location.hash.indexOf("#cdata=") == 0)
    {
        var data = decodeURIComponent(document.location.hash.substr(7));
        vm.__Deserialize(data);
        document.location.hash = "";
    }
    else
    {
        autoLoad();
    }
});
