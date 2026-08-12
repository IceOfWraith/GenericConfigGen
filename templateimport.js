/// Reads a finished set of AMP template files - a <name>.kvp plus its ports/updates/settings/metaconfig
/// manifests, or an instances own GenericModule.kvp with the JSON inline - and turns them back into the
/// shape the generator view model uses. The output uses the same field names as an exported
/// configuration, so importing a template and importing an export follow the same path.

const templateAuthorSuffix = " - Made with AMP Config Generator";

//Reverse of the lists the generator writes out.
const templateUpdateSourceIndexes = {
    "CopyFilePath": "0",
    "CreateSymlink": "1",
    "Executable": "2",
    "ExtractArchive": "3",
    "FetchURL": "4",
    "GithubRelease": "5",
    "SetExecutableFlag": "6",
    "StartApplication": "7",
    "SteamCMD": "8",
    //An instance's own kvp holds the UpdateSteps flag value rather than the name.
    "2": "0",
    "64": "1",
    "8": "2",
    "32768": "3",
    "1": "4",
    "16": "5",
    "32": "6",
    "4096": "7",
    "4": "8",
};

const templateConfigTypeIndexes = {
    "json": "0",
    "ini": "1",
    "xml": "2",
    "kvp": "3",
};

//The generators own port dropdown, keyed on the Ref the generator would have produced.
const templatePortTypes = {
    "steamqueryport": "Steam Query Port",
    "remoteadminport": "RCON Port",
    "maingameport": "Main Game Port",
};

//Values AMP works out for itself, or that the generator rebuilds from other answers. Importing them
//would only fight with the computed that owns them.
const templateDerivedKeys = [
    "Meta.DisplayImageSource", "Meta.EndpointURIFormat", "Meta.ConfigManifest", "Meta.MetaConfigManifest",
    "Meta.ConfigRoot", "Meta.SpecificDockerImage", "Meta.OS", "Meta.Author",
    "App.DisplayName", "App.RootDir", "App.BaseDirectory", "App.WorkingDir", "App.ExecutableWin",
    "App.ExecutableLinux", "App.LinuxCommandLineArgs", "App.SteamWorkshopDownloadLocation",
    "App.Ports", "App.UpdateSources", "App.EnvironmentVariables", "App.AppSettings",
];

//Bound to checkboxes in the UI, so they need real booleans rather than the "True"/"False" text.
const templateBooleanKeys = ["App_HasReadableConsole", "App_HasWriteableConsole"];

function templateParseBool(value) {
    return String(value).trim().toLowerCase() == "true" || String(value).trim() == "1";
}

function parseKvpText(text) {
    var result = {};
    for (const line of text.split(/\r?\n/)) {
        if (line.trim() == "" || line.trim().startsWith("#") || line.trim().startsWith("//")) { continue; }
        var separator = line.indexOf("=");
        if (separator == -1) { continue; }
        //The value is kept verbatim - a trailing space is meaningful for things like the parameter delimiter.
        result[line.substring(0, separator).trim()] = line.substring(separator + 1);
    }
    return result;
}

function classifyTemplateFile(name, text) {
    var lowerName = name.toLowerCase().split(/[\\\/]/).pop();

    if (lowerName.endsWith(".kvp")) { return { kind: "kvp", name: name, values: parseKvpText(text) }; }
    if (!lowerName.endsWith(".json")) { return { kind: "unknown", name: name }; }

    var data;
    try {
        data = JSON.parse(text);
    }
    catch (e) {
        return { kind: "unreadable", name: name, error: e.message };
    }

    //The filename is how the templates are laid out, so it wins - metaconfig has to be checked before
    //config, since it also ends in "config.json".
    if (lowerName.endsWith("metaconfig.json")) { return { kind: "metaconfig", name: name, data: data }; }
    if (lowerName.endsWith("ports.json")) { return { kind: "ports", name: name, data: data }; }
    if (lowerName.endsWith("updates.json")) { return { kind: "stages", name: name, data: data }; }
    if (lowerName.endsWith("config.json")) { return { kind: "settings", name: name, data: data }; }
    if (lowerName == "manifest.json") { return { kind: "manifest", name: name, data: data }; }

    //Renamed or unpacked somewhere else - work it out from what's inside instead.
    if (Array.isArray(data) && data.length > 0) {
        var first = data[0] || {};
        if ("UpdateSource" in first || "UpdateStageName" in first) { return { kind: "stages", name: name, data: data }; }
        if ("ConfigFile" in first) { return { kind: "metaconfig", name: name, data: data }; }
        if ("FieldName" in first || "InputType" in first) { return { kind: "settings", name: name, data: data }; }
        if ("Ref" in first || "Port" in first) { return { kind: "ports", name: name, data: data }; }
    }

    return { kind: "unknown", name: name };
}

//"@IncludeJson[thingports.json]" points at one of the other files in the set, otherwise the value is the
//JSON itself the way AMP writes it into an instances own kvp.
function resolveIncludedJson(value, files) {
    if (value == null) { return null; }

    var include = value.match(/^@IncludeJson\[(.+?)\]$/i);
    if (include) {
        var includedName = include[1].toLowerCase();
        var match = files.find(f => f.name.toLowerCase().split(/[\\\/]/).pop() == includedName);
        return match && match.data ? match.data : null;
    }

    if (value.trim().startsWith("[")) {
        try {
            return JSON.parse(value);
        }
        catch (e) {
            return null;
        }
    }

    return null;
}

function detectCompatibility(kvp) {
    var linuxExecutable = (kvp["App.ExecutableLinux"] || "").trim();
    var linuxArgs = kvp["App.LinuxCommandLineArgs"] || "";

    if (linuxExecutable == "/usr/bin/xvfb-run") { return linuxArgs.trim().startsWith("-a wine") ? "WineXvfb" : "ProtonXvfb"; }
    if (linuxExecutable == "/usr/bin/wine") { return "Wine"; }
    if (linuxExecutable.endsWith("/proton") || linuxExecutable.endsWith("proton")) { return "Proton"; }
    return "None";
}

//The executables are written relative to the working directory, which the generator rebuilds itself.
function stripWorkingDirectory(executable, workingDirectory) {
    if (executable == "" || workingDirectory == "") { return executable; }
    var prefixes = [workingDirectory + "\\", workingDirectory + "/"];
    for (const prefix of prefixes) {
        if (executable.startsWith(prefix)) { return executable.substring(prefix.length); }
    }
    return executable;
}

function windowsExecutableFromArgs(linuxArgs) {
    var quoted = linuxArgs.match(/"\.\/(.+?)"/);
    return quoted ? quoted[1] : "";
}

//The generator prepends its own wine/proton wrapper to whatever the author typed, so only the tail of
//the arguments belongs back in the input field. Matched by shape rather than by the executable name,
//since a template may spell the path differently to App.ExecutableWin.
const templateCompatibilityArgPrefixes = [
    /^-a\s+wine\s+"\.\/[^"]*"\s*/,
    /^-a\s+"\{\{\$FullRootDir\}\}1580130\/proton"\s+run\s+"\.\/[^"]*"\s*/,
    /^run\s+"\.\/[^"]*"\s*/,
    /^"\.\/[^"]*"\s*/,
];

function stripCompatibilityArgs(linuxArgs, compatibility) {
    if (compatibility == "None") { return linuxArgs; }

    for (const prefix of templateCompatibilityArgPrefixes) {
        if (prefix.test(linuxArgs)) { return linuxArgs.replace(prefix, "").trim(); }
    }

    return linuxArgs;
}

function supportedOSFromValue(value) {
    var text = String(value || "").trim();
    if (text == "") { return { windows: true, linux: true }; }

    if (/^\d+$/.test(text)) {
        var flags = parseInt(text, 10);
        return { windows: (flags & 1) != 0, linux: (flags & 2) != 0 };
    }

    var lower = text.toLowerCase();
    return { windows: lower.includes("windows") || lower.includes("all"), linux: lower.includes("linux") || lower.includes("all") };
}

function templateValuesFromKvp(kvp, warnings) {
    var values = {};

    for (const key of Object.keys(kvp)) {
        if (templateDerivedKeys.includes(key)) { continue; }
        if (key.indexOf(".") == -1) { continue; }

        var field = key.replace(".", "_");
        values[field] = templateBooleanKeys.includes(field) ? templateParseBool(kvp[key]) : kvp[key];
    }

    var os = supportedOSFromValue(kvp["Meta.OS"]);
    values._SupportsWindows = os.windows;
    values._SupportsLinux = os.linux;

    if (typeof kvp["Meta.Author"] !== "undefined") {
        values._Meta_Author = kvp["Meta.Author"].endsWith(templateAuthorSuffix)
            ? kvp["Meta.Author"].substring(0, kvp["Meta.Author"].length - templateAuthorSuffix.length)
            : kvp["Meta.Author"];
    }

    var imageSource = kvp["Meta.DisplayImageSource"] || "";
    if (imageSource.toLowerCase().startsWith("url:")) { values._DisplayImageSource = imageSource.substring(4); }

    var compatibility = detectCompatibility(kvp);
    values._compatibility = compatibility;

    var workingDirectory = (kvp["App.WorkingDir"] || "").trim();
    var linuxArgs = kvp["App.LinuxCommandLineArgs"] || "";
    var windowsExecutable = stripWorkingDirectory((kvp["App.ExecutableWin"] || "").trim(), workingDirectory);

    if (windowsExecutable == "" && compatibility != "None") { windowsExecutable = windowsExecutableFromArgs(linuxArgs); }

    values._WinExecutableName = windowsExecutable;
    values._LinuxExecutableName = compatibility == "None" ? stripWorkingDirectory((kvp["App.ExecutableLinux"] || "").trim(), workingDirectory) : "";
    values._App_LinuxCommandLineArgsInput = stripCompatibilityArgs(linuxArgs, compatibility);

    var workshopLocation = kvp["App.SteamWorkshopDownloadLocation"] || "";
    values._App_SteamWorkshopDownloadLocation = workshopLocation.replace("{{$FullBaseDir}}", "");

    if (compatibility != "None" && windowsExecutable == "") {
        warnings.push("A compatibility layer was detected but no Windows executable could be worked out - set it under 'Startup and Shutdown'.");
    }

    return values;
}

function templatePortsFromJson(ports, warnings) {
    if (!Array.isArray(ports)) { return []; }

    var protocolIndexes = { "both": "0", "tcp": "1", "udp": "2" };
    //PortProtocol in AMP is TCP=0, UDP=1, Both=2 - the generators own dropdown is ordered differently.
    var numericProtocolIndexes = { "0": "1", "1": "2", "2": "0" };
    var usedTypes = [];
    var result = [];

    var flattened = [];
    for (const port of ports) {
        if (port == null) { continue; }
        flattened.push(port);
        for (const child of port.ChildPorts || []) {
            if (child == null) { continue; }
            //A childs port is derived from its parent in AMP, which the generator has no equivalent for.
            flattened.push(Object.assign({}, child, { Port: child.Port != null ? child.Port : (port.Port || 0) + (child.Offset || 0) }));
            warnings.push(`Port '${child.Name || child.Ref}' was nested under '${port.Name || port.Ref}' and has been imported as a port of its own.`);
        }
    }

    for (const port of flattened) {
        var protocol = String(port.Protocol == null ? "Both" : port.Protocol).toLowerCase();
        var portType = templatePortTypes[String(port.Ref || "").toLowerCase()] || "Custom Port";

        if (portType != "Custom Port" && usedTypes.includes(portType)) {
            warnings.push(`More than one ${portType} was found - '${port.Name || port.Ref}' has been imported as a custom port.`);
            portType = "Custom Port";
        }

        if (portType != "Custom Port") { usedTypes.push(portType); }

        result.push({
            _Protocol: protocolIndexes[protocol] || numericProtocolIndexes[protocol] || "0",
            Port: String(port.Port == null ? "" : port.Port),
            _PortType: portType,
            _Name: port.Name || port.Ref || "",
            _Description: port.Description || "",
        });
    }

    return result;
}

function templateStagesFromJson(stages, warnings) {
    if (!Array.isArray(stages)) { return []; }

    var platformIndexes = { "all": "0", "linux": "1", "windows": "2", "31": "0", "2": "1", "1": "2" };
    var forcePlatformIndexes = { "linux": "1", "windows": "2", "2": "1", "1": "2" };
    var result = [];

    for (const stage of stages) {
        if (stage == null) { continue; }

        var sourceName = String(stage.UpdateSource == null ? "" : stage.UpdateSource);
        var sourceIndex = templateUpdateSourceIndexes[sourceName];

        if (typeof sourceIndex === "undefined") {
            warnings.push(`Update stage '${stage.UpdateStageName || sourceName}' uses the '${sourceName}' source type, which this generator cannot edit - it was skipped.`);
            continue;
        }

        var platform = String(stage.UpdateSourcePlatform == null ? "All" : stage.UpdateSourcePlatform).toLowerCase();
        var forcePlatform = String(stage.ForceDownloadPlatform == null ? "" : stage.ForceDownloadPlatform).toLowerCase();

        result.push({
            UpdateStageName: stage.UpdateStageName || "",
            _UpdateSourcePlatform: platformIndexes[platform] || "0",
            _UpdateSource: sourceIndex,
            UpdateSourceData: stage.UpdateSourceData || "",
            UpdateSourceArgs: stage.UpdateSourceArgs || "",
            UpdateSourceVersion: stage.UpdateSourceVersion || "",
            UpdateSourceTarget: stage.UpdateSourceTarget || "",
            UnzipUpdateSource: stage.UnzipUpdateSource === true,
            OverwriteExistingFiles: stage.OverwriteExistingFiles === true,
            _ForceDownloadPlatform: forcePlatformIndexes[forcePlatform] || "0",
            UpdateSourceConditionSetting: stage.UpdateSourceConditionSetting || null,
            UpdateSourceConditionValue: stage.UpdateSourceConditionValue || null,
            DeleteAfterExtract: stage.DeleteAfterExtract !== false,
            OneShot: stage.OneShot === true,
        });
    }

    return result;
}

//Checkboxes are keyed on the state ("False"/"True"), but older generated configurations had it the other
//way around, with the written value as the key and the state as the label.
function checkboxValuesFromEnum(enumValues) {
    var keys = Object.keys(enumValues || {});
    var stateKeyed = keys.some(k => k.toLowerCase() == "true" || k.toLowerCase() == "false");

    if (stateKeyed) {
        var checked = "true";
        var unchecked = "false";
        for (const key of keys) {
            if (key.toLowerCase() == "true") { checked = enumValues[key]; }
            if (key.toLowerCase() == "false") { unchecked = enumValues[key]; }
        }
        return { checked: checked, unchecked: unchecked };
    }

    var result = { checked: "true", unchecked: "false" };
    for (const key of keys) {
        if (String(enumValues[key]).toLowerCase() == "true") { result.checked = key; }
        if (String(enumValues[key]).toLowerCase() == "false") { result.unchecked = key; }
    }
    return result;
}

function templateSettingsFromJson(settings, warnings) {
    if (!Array.isArray(settings)) { return []; }

    var result = [];

    for (const setting of settings) {
        if (setting == null) { continue; }

        var inputType = setting.InputType || "text";
        var enumValues = setting.EnumValues || {};
        var checkboxValues = inputType == "checkbox" ? checkboxValuesFromEnum(enumValues) : { checked: "true", unchecked: "false" };

        var enumMappings = [];
        if (inputType == "enum") {
            for (const key of Object.keys(enumValues)) {
                enumMappings.push({ _enumKey: key, _enumValue: enumValues[key] });
            }
        }

        if (setting.Special) {
            warnings.push(`Setting '${setting.DisplayName || setting.FieldName}' uses the 'Special' option, which this generator cannot edit - that part will be lost if you download the configuration.`);
        }

        result.push({
            DisplayName: setting.DisplayName || "",
            _Category: setting.Category || "",
            Subcategory: setting.Subcategory || "Server:dns:1",
            Description: setting.Description || "",
            _Keywords: setting.Keywords || "",
            FieldName: setting.FieldName || "",
            InputType: inputType,
            MinValue: setting.MinValue == null ? "" : String(setting.MinValue),
            MaxValue: setting.MaxValue == null ? "" : String(setting.MaxValue),
            IsFlagArgument: setting.IsFlagArgument === true,
            IncludeInCommandLine: setting.IncludeInCommandLine === true,
            DefaultValue: setting.DefaultValue == null ? "" : String(setting.DefaultValue),
            Placeholder: setting.Placeholder == null ? "" : String(setting.Placeholder),
            Suffix: setting.Suffix || "",
            Hidden: setting.Hidden === true,
            SkipIfEmpty: setting.SkipIfEmpty === true,
            _CheckedValue: checkboxValues.checked,
            _UncheckedValue: checkboxValues.unchecked,
            _EnumMappings: enumMappings,
        });
    }

    return result;
}

function templateConfigFilesFromJson(configFiles) {
    if (!Array.isArray(configFiles)) { return []; }

    var result = [];

    for (const configFile of configFiles) {
        if (configFile == null) { continue; }
        var configType = String(configFile.ConfigType || "auto").toLowerCase();
        result.push({
            ConfigFile: configFile.ConfigFile || "",
            _ConfigType: templateConfigTypeIndexes[configType] || "4",
            _AutoMap: configFile.AutoMap === true,
        });
    }

    return result;
}

/// Takes [{ name, text }] and returns the data the view model can be filled in from, along with a note
/// of everything that was read and anything that could not be brought across.
function parseTemplateFiles(rawFiles) {
    var warnings = [];
    var imported = [];
    var files = rawFiles.map(f => classifyTemplateFile(f.name, f.text));

    for (const file of files) {
        if (file.kind == "unreadable") { warnings.push(`${file.name} is not valid JSON and was skipped (${file.error}).`); }
        else if (file.kind == "unknown") { warnings.push(`${file.name} was not recognised as part of a template and was skipped.`); }
    }

    var kvpFile = files.find(f => f.kind == "kvp");
    if (!kvpFile) { return { ok: false, warnings: ["No .kvp file was found - the configuration file is what everything else is read from."], imported: imported }; }

    var kvp = kvpFile.values;
    var values = templateValuesFromKvp(kvp, warnings);
    imported.push(`${kvpFile.name} (${Object.keys(kvp).length} settings)`);

    var portsFile = files.find(f => f.kind == "ports");
    var stagesFile = files.find(f => f.kind == "stages");
    var settingsFile = files.find(f => f.kind == "settings");
    var configFilesFile = files.find(f => f.kind == "metaconfig");

    var portsData = portsFile ? portsFile.data : resolveIncludedJson(kvp["App.Ports"], files);
    var stagesData = stagesFile ? stagesFile.data : resolveIncludedJson(kvp["App.UpdateSources"], files);

    var ports = templatePortsFromJson(portsData, warnings);
    var stages = templateStagesFromJson(stagesData, warnings);
    var settings = templateSettingsFromJson(settingsFile ? settingsFile.data : null, warnings);
    var configFiles = templateConfigFilesFromJson(configFilesFile ? configFilesFile.data : null);

    if (portsFile) { imported.push(`${portsFile.name} (${ports.length} ports)`); }
    else if (ports.length > 0) { imported.push(`${ports.length} ports from the configuration file`); }
    else { warnings.push("No ports were found - add them under 'Networking'."); }

    if (stagesFile) { imported.push(`${stagesFile.name} (${stages.length} update stages)`); }
    else if (stages.length > 0) { imported.push(`${stages.length} update stages from the configuration file`); }
    else { warnings.push("No update stages were found - add them under 'Update Sources'."); }

    if (settingsFile) { imported.push(`${settingsFile.name} (${settings.length} settings)`); }
    else { warnings.push("No settings manifest was found - add any settings under 'Configuration and Settings'."); }

    if (configFilesFile) { imported.push(`${configFilesFile.name} (${configFiles.length} config files)`); }

    return {
        ok: true,
        values: values,
        ports: ports,
        stages: stages,
        settings: settings,
        configFiles: configFiles,
        warnings: warnings,
        imported: imported,
    };
}
