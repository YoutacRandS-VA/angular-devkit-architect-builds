"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const node_1 = require("@angular-devkit/core/node");
const Observable_1 = require("rxjs/Observable");
const of_1 = require("rxjs/observable/of");
const throw_1 = require("rxjs/observable/throw");
const operators_1 = require("rxjs/operators");
class ProjectNotFoundException extends core_1.BaseException {
    constructor(name) {
        const nameOrDefault = name ? `Project '${name}'` : `Default project`;
        super(`${nameOrDefault} could not be found in workspace.`);
    }
}
exports.ProjectNotFoundException = ProjectNotFoundException;
class TargetNotFoundException extends core_1.BaseException {
    constructor(name) {
        const nameOrDefault = name ? `Target '${name}'` : `Default target`;
        super(`${nameOrDefault} could not be found in workspace.`);
    }
}
exports.TargetNotFoundException = TargetNotFoundException;
class ConfigurationNotFoundException extends core_1.BaseException {
    constructor(name) {
        super(`Configuration '${name}' could not be found in project.`);
    }
}
exports.ConfigurationNotFoundException = ConfigurationNotFoundException;
class SchemaValidationException extends core_1.BaseException {
    constructor(errors) {
        super(`Schema validation failed with the following errors:\n  ${errors.join('\n  ')}`);
    }
}
exports.SchemaValidationException = SchemaValidationException;
// TODO: break this exception apart into more granular ones.
class BuilderCannotBeResolvedException extends core_1.BaseException {
    constructor(builder) {
        super(`Builder '${builder}' cannot be resolved.`);
    }
}
exports.BuilderCannotBeResolvedException = BuilderCannotBeResolvedException;
class WorkspaceNotYetLoadedException extends core_1.BaseException {
    constructor() { super(`Workspace needs to be loaded before Architect is used.`); }
}
exports.WorkspaceNotYetLoadedException = WorkspaceNotYetLoadedException;
class Architect {
    constructor(_root, _host) {
        this._root = _root;
        this._host = _host;
        this._workspaceSchema = core_1.join(core_1.normalize(__dirname), 'workspace-schema.json');
        this._buildersSchema = core_1.join(core_1.normalize(__dirname), 'builders-schema.json');
    }
    loadWorkspaceFromHost(workspacePath) {
        return this._host.read(core_1.join(this._root, workspacePath)).pipe(operators_1.concatMap((buffer) => {
            const json = JSON.parse(core_1.virtualFs.fileBufferToString(buffer));
            return this.loadWorkspaceFromJson(json);
        }));
    }
    loadWorkspaceFromJson(json) {
        return this._validateAgainstSchema(json, this._workspaceSchema).pipe(operators_1.concatMap((validatedWorkspace) => {
            this._workspace = validatedWorkspace;
            return of_1.of(this);
        }));
    }
    getTarget(options = {}) {
        let { project, target: targetName } = options;
        const { configuration, overrides } = options;
        if (!this._workspace) {
            throw new WorkspaceNotYetLoadedException();
        }
        project = project || this._workspace.defaultProject;
        const workspaceProject = this._workspace.projects[project];
        if (!workspaceProject) {
            throw new ProjectNotFoundException(project);
        }
        targetName = targetName || workspaceProject.defaultTarget;
        const workspaceTarget = workspaceProject.targets[targetName];
        if (!workspaceTarget) {
            throw new TargetNotFoundException(targetName);
        }
        const workspaceTargetOptions = workspaceTarget.options;
        let workspaceConfiguration;
        if (configuration) {
            workspaceConfiguration = workspaceTarget.configurations
                && workspaceTarget.configurations[configuration];
            if (!workspaceConfiguration) {
                throw new ConfigurationNotFoundException(configuration);
            }
        }
        // Resolve root for the target.
        // TODO: add Path format to JSON schemas
        const target = {
            root: core_1.resolve(this._root, core_1.normalize(workspaceProject.root)),
            projectType: workspaceProject.projectType,
            builder: workspaceTarget.builder,
            options: Object.assign({}, workspaceTargetOptions, workspaceConfiguration, overrides),
        };
        // Return a copy of the target object, JSON validation changes objects and we don't
        // want the original properties to be modified.
        return JSON.parse(JSON.stringify(target));
    }
    // Will run the target using the target.
    run(target, partialContext = {}) {
        const context = Object.assign({ logger: new core_1.logging.NullLogger(), architect: this, host: this._host }, partialContext);
        let builderDescription;
        return this.getBuilderDescription(target).pipe(operators_1.concatMap(description => {
            builderDescription = description;
            return this.validateBuilderOptions(target, builderDescription);
        }), operators_1.concatMap(() => of_1.of(this.getBuilder(builderDescription, context))), operators_1.concatMap(builder => builder.run(target)));
    }
    getBuilderDescription(target) {
        return new Observable_1.Observable((obs) => {
            // TODO: this probably needs to be more like NodeModulesEngineHost.
            const basedir = core_1.getSystemPath(this._root);
            const [pkg, builderName] = target.builder.split(':');
            const pkgJsonPath = node_1.resolve(pkg, { basedir, resolvePackageJson: true });
            let buildersJsonPath;
            // Read the `builders` entry of package.json.
            return this._host.read(core_1.normalize(pkgJsonPath)).pipe(operators_1.concatMap(buffer => of_1.of(core_1.parseJson(core_1.virtualFs.fileBufferToString(buffer), core_1.JsonParseMode.Loose))), operators_1.concatMap((pkgJson) => {
                const pkgJsonBuildersentry = pkgJson['builders'];
                if (!pkgJsonBuildersentry) {
                    throw new BuilderCannotBeResolvedException(target.builder);
                }
                buildersJsonPath = core_1.join(core_1.dirname(core_1.normalize(pkgJsonPath)), pkgJsonBuildersentry);
                return this._host.read(buildersJsonPath);
            }), operators_1.concatMap((buffer) => of_1.of(JSON.parse(core_1.virtualFs.fileBufferToString(buffer)))), 
            // Validate builders json.
            operators_1.concatMap((builderMap) => this._validateAgainstSchema(builderMap, this._buildersSchema)), operators_1.concatMap((builderMap) => {
                const builderDescription = builderMap.builders[builderName];
                if (!builderDescription) {
                    throw new BuilderCannotBeResolvedException(target.builder);
                }
                // Resolve paths in the builder description.
                const builderJsonDir = core_1.dirname(buildersJsonPath);
                builderDescription.schema = core_1.join(builderJsonDir, builderDescription.schema);
                builderDescription.class = core_1.join(builderJsonDir, builderDescription.class);
                // Validate options again builder schema.
                return of_1.of(builderDescription);
            })).subscribe(obs);
        });
    }
    validateBuilderOptions(target, builderDescription) {
        return this._validateAgainstSchema(target.options, core_1.normalize(builderDescription.schema));
    }
    getBuilder(builderDescription, context) {
        // TODO: support more than the default export, maybe via builder#import-name.
        const builderModule = require(core_1.getSystemPath(builderDescription.class));
        const builderClass = builderModule['default'];
        return new builderClass(context);
    }
    // Warning: this method changes contentJson in place.
    // TODO: add transforms to resolve paths.
    _validateAgainstSchema(contentJson, schemaPath) {
        const registry = new core_1.schema.CoreSchemaRegistry();
        return this._host.read(schemaPath).pipe(operators_1.concatMap((buffer) => of_1.of(JSON.parse(core_1.virtualFs.fileBufferToString(buffer)))), operators_1.concatMap((schemaContent) => registry.compile(schemaContent)), operators_1.concatMap(validator => validator(contentJson)), operators_1.concatMap(validatorResult => {
            if (validatorResult.success) {
                return of_1.of(contentJson);
            }
            else {
                return throw_1._throw(new SchemaValidationException(validatorResult.errors));
            }
        }));
    }
}
exports.Architect = Architect;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJjaGl0ZWN0LmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9hcmNoaXRlY3Qvc3JjL2FyY2hpdGVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOztBQUVILCtDQWM4QjtBQUM5QixvREFBbUU7QUFDbkUsZ0RBQTZDO0FBQzdDLDJDQUF3QztBQUN4QyxpREFBK0M7QUFDL0MsOENBQTJDO0FBWTNDLDhCQUFzQyxTQUFRLG9CQUFhO0lBQ3pELFlBQVksSUFBYTtRQUN2QixNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLFlBQVksSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDO1FBQ3JFLEtBQUssQ0FBQyxHQUFHLGFBQWEsbUNBQW1DLENBQUMsQ0FBQztJQUM3RCxDQUFDO0NBQ0Y7QUFMRCw0REFLQztBQUVELDZCQUFxQyxTQUFRLG9CQUFhO0lBQ3hELFlBQVksSUFBYTtRQUN2QixNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDO1FBQ25FLEtBQUssQ0FBQyxHQUFHLGFBQWEsbUNBQW1DLENBQUMsQ0FBQztJQUM3RCxDQUFDO0NBQ0Y7QUFMRCwwREFLQztBQUVELG9DQUE0QyxTQUFRLG9CQUFhO0lBQy9ELFlBQVksSUFBWTtRQUN0QixLQUFLLENBQUMsa0JBQWtCLElBQUksa0NBQWtDLENBQUMsQ0FBQztJQUNsRSxDQUFDO0NBQ0Y7QUFKRCx3RUFJQztBQUVELCtCQUF1QyxTQUFRLG9CQUFhO0lBQzFELFlBQVksTUFBZ0I7UUFDMUIsS0FBSyxDQUFDLDBEQUEwRCxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN6RixDQUFDO0NBQ0Y7QUFKRCw4REFJQztBQUVELDREQUE0RDtBQUM1RCxzQ0FBOEMsU0FBUSxvQkFB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LENBQUMsQ0FBQyxFQUM3RCxxQkFBUyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQzlDLHFCQUFTLENBQUMsZUFBZSxDQUFDLEVBQUU7WUFDMUIsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQzVCLE1BQU0sQ0FBQyxPQUFFLENBQUMsV0FBZ0IsQ0FBQyxDQUFDO1lBQzlCLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixNQUFNLENBQUMsY0FBTSxDQUFDLElBQUkseUJBQXlCLENBQUMsZUFBZSxDQUFDLE1BQWtCLENBQUMsQ0FBQyxDQUFDO1lBQ25GLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FDSCxDQUFDO0lBQ0osQ0FBQztDQUNGO0FBMUxELDhCQTBMQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQmFzZUV4Y2VwdGlvbixcbiAgSnNvbk9iamVjdCxcbiAgSnNvblBhcnNlTW9kZSxcbiAgUGF0aCxcbiAgZGlybmFtZSxcbiAgZ2V0U3lzdGVtUGF0aCxcbiAgam9pbixcbiAgbG9nZ2luZyxcbiAgbm9ybWFsaXplLFxuICBwYXJzZUpzb24sXG4gIHJlc29sdmUsXG4gIHNjaGVtYSxcbiAgdmlydHVhbEZzLFxufSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XG5pbXBvcnQgeyByZXNvbHZlIGFzIG5vZGVSZXNvbHZlIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUvbm9kZSc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcy9PYnNlcnZhYmxlJztcbmltcG9ydCB7IG9mIH0gZnJvbSAncnhqcy9vYnNlcnZhYmxlL29mJztcbmltcG9ydCB7IF90aHJvdyB9IGZyb20gJ3J4anMvb2JzZXJ2YWJsZS90aHJvdyc7XG5pbXBvcnQgeyBjb25jYXRNYXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge1xuICBCdWlsZEV2ZW50LFxuICBCdWlsZGVyLFxuICBCdWlsZGVyQ29uc3RydWN0b3IsXG4gIEJ1aWxkZXJDb250ZXh0LFxuICBCdWlsZGVyRGVzY3JpcHRpb24sXG4gIEJ1aWxkZXJNYXAsXG59IGZyb20gJy4vYnVpbGRlcic7XG5pbXBvcnQgeyBXb3Jrc3BhY2UgfSBmcm9tICcuL3dvcmtzcGFjZSc7XG5cblxuZXhwb3J0IGNsYXNzIFByb2plY3ROb3RGb3VuZEV4Y2VwdGlvbiBleHRlbmRzIEJhc2VFeGNlcHRpb24ge1xuICBjb25zdHJ1Y3RvcihuYW1lPzogc3RyaW5nKSB7XG4gICAgY29uc3QgbmFtZU9yRGVmYXVsdCA9IG5hbWUgPyBgUHJvamVjdCAnJHtuYW1lfSdgIDogYERlZmF1bHQgcHJvamVjdGA7XG4gICAgc3VwZXIoYCR7bmFtZU9yRGVmYXVsdH0gY291bGQgbm90IGJlIGZvdW5kIGluIHdvcmtzcGFjZS5gKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVGFyZ2V0Tm90Rm91bmRFeGNlcHRpb24gZXh0ZW5kcyBCYXNlRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3IobmFtZT86IHN0cmluZykge1xuICAgIGNvbnN0IG5hbWVPckRlZmF1bHQgPSBuYW1lID8gYFRhcmdldCAnJHtuYW1lfSdgIDogYERlZmF1bHQgdGFyZ2V0YDtcbiAgICBzdXBlcihgJHtuYW1lT3JEZWZhdWx0fSBjb3VsZCBub3QgYmUgZm91bmQgaW4gd29ya3NwYWNlLmApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb25maWd1cmF0aW9uTm90Rm91bmRFeGNlcHRpb24gZXh0ZW5kcyBCYXNlRXhjZXB0aW9uIHtcbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nKSB7XG4gICAgc3VwZXIoYENvbmZpZ3VyYXRpb24gJyR7bmFtZX0nIGNvdWxkIG5vdCBiZSBmb3VuZCBpbiBwcm9qZWN0LmApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTY2hlbWFWYWxpZGF0aW9uRXhjZXB0aW9uIGV4dGVuZHMgQmFzZUV4Y2VwdGlvbiB7XG4gIGNvbnN0cnVjdG9yKGVycm9yczogc3RyaW5nW10pIHtcbiAgICBzdXBlcihgU2NoZW1hIHZhbGlkYXRpb24gZmFpbGVkIHdpdGggdGhlIGZvbGxvd2luZyBlcnJvcnM6XFxuICAke2Vycm9ycy5qb2luKCdcXG4gICcpfWApO1xuICB9XG59XG5cbi8vIFRPRE86IGJyZWFrIHRoaXMgZXhjZXB0aW9uIGFwYXJ0IGludG8gbW9yZSBncmFudWxhciBvbmVzLlxuZXhwb3J0IGNsYXNzIEJ1aWxkZXJDYW5ub3RCZVJlc29sdmVkRXhjZXB0aW9uIGV4dGVuZHMgQmFzZUV4Y2VwdGlvbiB7XG4gIGNvbnN0cnVjdG9yKGJ1aWxkZXI6IHN0cmluZykge1xuICAgIHN1cGVyKGBCdWlsZGVyICcke2J1aWxkZXJ9JyBjYW5ub3QgYmUgcmVzb2x2ZWQuYCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFdvcmtzcGFjZU5vdFlldExvYWRlZEV4Y2VwdGlvbiBleHRlbmRzIEJhc2VFeGNlcHRpb24ge1xuICBjb25zdHJ1Y3RvcigpIHsgc3VwZXIoYFdvcmtzcGFjZSBuZWVkcyB0byBiZSBsb2FkZWQgYmVmb3JlIEFyY2hpdGVjdCBpcyB1c2VkLmApOyB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGFyZ2V0PE9wdGlvbnNUID0ge30+IHtcbiAgcm9vdDogUGF0aDtcbiAgcHJvamVjdFR5cGU6IHN0cmluZztcbiAgYnVpbGRlcjogc3RyaW5nO1xuICBvcHRpb25zOiBPcHRpb25zVDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBUYXJnZXRPcHRpb25zPE9wdGlvbnNUID0ge30+IHtcbiAgcHJvamVjdD86IHN0cmluZztcbiAgdGFyZ2V0Pzogc3RyaW5nO1xuICBjb25maWd1cmF0aW9uPzogc3RyaW5nO1xuICBvdmVycmlkZXM/OiBQYXJ0aWFsPE9wdGlvbnNUPjtcbn1cblxuZXhwb3J0IGNsYXNzIEFyY2hpdGVjdCB7XG4gIHByaXZhdGUgcmVhZG9ubHkgX3dvcmtzcGFjZVNjaGVtYSA9IGpvaW4obm9ybWFsaXplKF9fZGlybmFtZSksICd3b3Jrc3BhY2Utc2NoZW1hLmpzb24nKTtcbiAgcHJpdmF0ZSByZWFkb25seSBfYnVpbGRlcnNTY2hlbWEgPSBqb2luKG5vcm1hbGl6ZShfX2Rpcm5hbWUpLCAnYnVpbGRlcnMtc2NoZW1hLmpzb24nKTtcbiAgcHJpdmF0ZSBfd29ya3NwYWNlOiBXb3Jrc3BhY2U7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfcm9vdDogUGF0aCwgcHJpdmF0ZSBfaG9zdDogdmlydHVhbEZzLkhvc3Q8e30+KSB7IH1cblxuICBsb2FkV29ya3NwYWNlRnJvbUhvc3Qod29ya3NwYWNlUGF0aDogUGF0aCkge1xuICAgIHJldHVybiB0aGlzLl9ob3N0LnJlYWQoam9pbih0aGlzLl9yb290LCB3b3Jrc3BhY2VQYXRoKSkucGlwZShcbiAgICAgIGNvbmNhdE1hcCgoYnVmZmVyKSA9PiB7XG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnBhcnNlKHZpcnR1YWxGcy5maWxlQnVmZmVyVG9TdHJpbmcoYnVmZmVyKSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMubG9hZFdvcmtzcGFjZUZyb21Kc29uKGpzb24pO1xuICAgICAgfSksXG4gICAgKTtcbiAgfVxuXG4gIGxvYWRXb3Jrc3BhY2VGcm9tSnNvbihqc29uOiBXb3Jrc3BhY2UpIHtcbiAgICByZXR1cm4gdGhpcy5fdmFsaWRhdGVBZ2FpbnN0U2NoZW1hKGpzb24sIHRoaXMuX3dvcmtzcGFjZVNjaGVtYSkucGlwZShcbiAgICAgIGNvbmNhdE1hcCgodmFsaWRhdGVkV29ya3NwYWNlOiBXb3Jrc3BhY2UpID0+IHtcbiAgICAgICAgdGhpcy5fd29ya3NwYWNlID0gdmFsaWRhdGVkV29ya3NwYWNlO1xuXG4gICAgICAgIHJldHVybiBvZih0aGlzKTtcbiAgICAgIH0pLFxuICAgICk7XG4gIH1cblxuICBnZXRUYXJnZXQ8T3B0aW9uc1Q+KG9wdGlvbnM6IFRhcmdldE9wdGlvbnMgPSB7fSk6IFRhcmdldDxPcHRpb25zVD4ge1xuICAgIGxldCB7IHByb2plY3QsIHRhcmdldDogdGFyZ2V0TmFtZSB9ID0gb3B0aW9ucztcbiAgICBjb25zdCB7IGNvbmZpZ3VyYXRpb24sIG92ZXJyaWRlcyB9ID0gb3B0aW9ucztcblxuICAgIGlmICghdGhpcy5fd29ya3NwYWNlKSB7XG4gICAgICB0aHJvdyBuZXcgV29ya3NwYWNlTm90WWV0TG9hZGVkRXhjZXB0aW9uKCk7XG4gICAgfVxuXG4gICAgcHJvamVjdCA9IHByb2plY3QgfHwgdGhpcy5fd29ya3NwYWNlLmRlZmF1bHRQcm9qZWN0IGFzIHN0cmluZztcbiAgICBjb25zdCB3b3Jrc3BhY2VQcm9qZWN0ID0gdGhpcy5fd29ya3NwYWNlLnByb2plY3RzW3Byb2plY3RdO1xuXG4gICAgaWYgKCF3b3Jrc3BhY2VQcm9qZWN0KSB7XG4gICAgICB0aHJvdyBuZXcgUHJvamVjdE5vdEZvdW5kRXhjZXB0aW9uKHByb2plY3QpO1xuICAgIH1cblxuICAgIHRhcmdldE5hbWUgPSB0YXJnZXROYW1lIHx8IHdvcmtzcGFjZVByb2plY3QuZGVmYXVsdFRhcmdldCBhcyBzdHJpbmc7XG4gICAgY29uc3Qgd29ya3NwYWNlVGFyZ2V0ID0gd29ya3NwYWNlUHJvamVjdC50YXJnZXRzW3RhcmdldE5hbWVdO1xuXG4gICAgaWYgKCF3b3Jrc3BhY2VUYXJnZXQpIHtcbiAgICAgIHRocm93IG5ldyBUYXJnZXROb3RGb3VuZEV4Y2VwdGlvbih0YXJnZXROYW1lKTtcbiAgICB9XG5cbiAgICBjb25zdCB3b3Jrc3BhY2VUYXJnZXRPcHRpb25zID0gd29ya3NwYWNlVGFyZ2V0Lm9wdGlvbnM7XG4gICAgbGV0IHdvcmtzcGFjZUNvbmZpZ3VyYXRpb247XG5cbiAgICBpZiAoY29uZmlndXJhdGlvbikge1xuICAgICAgd29ya3NwYWNlQ29uZmlndXJhdGlvbiA9IHdvcmtzcGFjZVRhcmdldC5jb25maWd1cmF0aW9uc1xuICAgICAgICAmJiB3b3Jrc3BhY2VUYXJnZXQuY29uZmlndXJhdGlvbnNbY29uZmlndXJhdGlvbl07XG5cbiAgICAgIGlmICghd29ya3NwYWNlQ29uZmlndXJhdGlvbikge1xuICAgICAgICB0aHJvdyBuZXcgQ29uZmlndXJhdGlvbk5vdEZvdW5kRXhjZXB0aW9uKGNvbmZpZ3VyYXRpb24pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJlc29sdmUgcm9vdCBmb3IgdGhlIHRhcmdldC5cbiAgICAvLyBUT0RPOiBhZGQgUGF0aCBmb3JtYXQgdG8gSlNPTiBzY2hlbWFzXG4gICAgY29uc3QgdGFyZ2V0OiBUYXJnZXQ8T3B0aW9uc1Q+ID0ge1xuICAgICAgcm9vdDogcmVzb2x2ZSh0aGlzLl9yb290LCBub3JtYWxpemUod29ya3NwYWNlUHJvamVjdC5yb290KSksXG4gICAgICBwcm9qZWN0VHlwZTogd29ya3NwYWNlUHJvamVjdC5wcm9qZWN0VHlwZSxcbiAgICAgIGJ1aWxkZXI6IHdvcmtzcGFjZVRhcmdldC5idWlsZGVyLFxuICAgICAgb3B0aW9uczoge1xuICAgICAgICAuLi53b3Jrc3BhY2VUYXJnZXRPcHRpb25zLFxuICAgICAgICAuLi53b3Jrc3BhY2VDb25maWd1cmF0aW9uLFxuICAgICAgICAuLi5vdmVycmlkZXMgYXMge30sXG4gICAgICB9IGFzIE9wdGlvbnNULFxuICAgIH07XG5cbiAgICAvLyBSZXR1cm4gYSBjb3B5IG9mIHRoZSB0YXJnZXQgb2JqZWN0LCBKU09OIHZhbGlkYXRpb24gY2hhbmdlcyBvYmplY3RzIGFuZCB3ZSBkb24ndFxuICAgIC8vIHdhbnQgdGhlIG9yaWdpbmFsIHByb3BlcnRpZXMgdG8gYmUgbW9kaWZpZWQuXG4gICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGFyZ2V0KSk7XG4gIH1cblxuICAvLyBXaWxsIHJ1biB0aGUgdGFyZ2V0IHVzaW5nIHRoZSB0YXJnZXQuXG4gIHJ1bjxPcHRpb25zVD4oXG4gICAgdGFyZ2V0OiBUYXJnZXQ8T3B0aW9uc1Q+LFxuICAgIHBhcnRpYWxDb250ZXh0OiBQYXJ0aWFsPEJ1aWxkZXJDb250ZXh0PiA9IHt9LFxuICApOiBPYnNlcnZhYmxlPEJ1aWxkRXZlbnQ+IHtcbiAgICBjb25zdCBjb250ZXh0OiBCdWlsZGVyQ29udGV4dCA9IHtcbiAgICAgIGxvZ2dlcjogbmV3IGxvZ2dpbmcuTnVsbExvZ2dlcigpLFxuICAgICAgYXJjaGl0ZWN0OiB0aGlzLFxuICAgICAgaG9zdDogdGhpcy5faG9zdCxcbiAgICAgIC4uLnBhcnRpYWxDb250ZXh0LFxuICAgIH07XG5cbiAgICBsZXQgYnVpbGRlckRlc2NyaXB0aW9uOiBCdWlsZGVyRGVzY3JpcHRpb247XG5cbiAgICByZXR1cm4gdGhpcy5nZXRCdWlsZGVyRGVzY3JpcHRpb24odGFyZ2V0KS5waXBlKFxuICAgICAgY29uY2F0TWFwKGRlc2NyaXB0aW9uID0+IHtcbiAgICAgICAgYnVpbGRlckRlc2NyaXB0aW9uID0gZGVzY3JpcHRpb247XG5cbiAgICAgICAgcmV0dXJuIHRoaXMudmFsaWRhdGVCdWlsZGVyT3B0aW9ucyh0YXJnZXQsIGJ1aWxkZXJEZXNjcmlwdGlvbik7XG4gICAgICB9KSxcbiAgICAgIGNvbmNhdE1hcCgoKSA9PiBvZih0aGlzLmdldEJ1aWxkZXIoYnVpbGRlckRlc2NyaXB0aW9uLCBjb250ZXh0KSkpLFxuICAgICAgY29uY2F0TWFwKGJ1aWxkZXIgPT4gYnVpbGRlci5ydW4odGFyZ2V0KSksXG4gICAgKTtcbiAgfVxuXG4gIGdldEJ1aWxkZXJEZXNjcmlwdGlvbjxPcHRpb25zVD4odGFyZ2V0OiBUYXJnZXQ8T3B0aW9uc1Q+KTogT2JzZXJ2YWJsZTxCdWlsZGVyRGVzY3JpcHRpb24+IHtcbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGUoKG9icykgPT4ge1xuICAgICAgLy8gVE9ETzogdGhpcyBwcm9iYWJseSBuZWVkcyB0byBiZSBtb3JlIGxpa2UgTm9kZU1vZHVsZXNFbmdpbmVIb3N0LlxuICAgICAgY29uc3QgYmFzZWRpciA9IGdldFN5c3RlbVBhdGgodGhpcy5fcm9vdCk7XG4gICAgICBjb25zdCBbcGtnLCBidWlsZGVyTmFtZV0gPSB0YXJnZXQuYnVpbGRlci5zcGxpdCgnOicpO1xuICAgICAgY29uc3QgcGtnSnNvblBhdGggPSBub2RlUmVzb2x2ZShwa2csIHsgYmFzZWRpciwgcmVzb2x2ZVBhY2thZ2VKc29uOiB0cnVlIH0pO1xuICAgICAgbGV0IGJ1aWxkZXJzSnNvblBhdGg6IFBhdGg7XG5cbiAgICAgIC8vIFJlYWQgdGhlIGBidWlsZGVyc2AgZW50cnkgb2YgcGFja2FnZS5qc29uLlxuICAgICAgcmV0dXJuIHRoaXMuX2hvc3QucmVhZChub3JtYWxpemUocGtnSnNvblBhdGgpKS5waXBlKFxuICAgICAgICBjb25jYXRNYXAoYnVmZmVyID0+XG4gICAgICAgICAgb2YocGFyc2VKc29uKHZpcnR1YWxGcy5maWxlQnVmZmVyVG9TdHJpbmcoYnVmZmVyKSwgSnNvblBhcnNlTW9kZS5Mb29zZSkpKSxcbiAgICAgICAgY29uY2F0TWFwKChwa2dKc29uOiBKc29uT2JqZWN0KSA9PiB7XG4gICAgICAgICAgY29uc3QgcGtnSnNvbkJ1aWxkZXJzZW50cnkgPSBwa2dKc29uWydidWlsZGVycyddIGFzIHN0cmluZztcbiAgICAgICAgICBpZiAoIXBrZ0pzb25CdWlsZGVyc2VudHJ5KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgQnVpbGRlckNhbm5vdEJlUmVzb2x2ZWRFeGNlcHRpb24odGFyZ2V0LmJ1aWxkZXIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGJ1aWxkZXJzSnNvblBhdGggPSBqb2luKGRpcm5hbWUobm9ybWFsaXplKHBrZ0pzb25QYXRoKSksIHBrZ0pzb25CdWlsZGVyc2VudHJ5KTtcblxuICAgICAgICAgIHJldHVybiB0aGlzLl9ob3N0LnJlYWQoYnVpbGRlcnNKc29uUGF0aCk7XG4gICAgICAgIH0pLFxuICAgICAgICBjb25jYXRNYXAoKGJ1ZmZlcikgPT4gb2YoSlNPTi5wYXJzZSh2aXJ0dWFsRnMuZmlsZUJ1ZmZlclRvU3RyaW5nKGJ1ZmZlcikpKSksXG4gICAgICAgIC8vIFZhbGlkYXRlIGJ1aWxkZXJzIGpzb24uXG4gICAgICAgIGNvbmNhdE1hcCgoYnVpbGRlck1hcCkgPT5cbiAgICAgICAgICB0aGlzLl92YWxpZGF0ZUFnYWluc3RTY2hlbWE8QnVpbGRlck1hcD4oYnVpbGRlck1hcCwgdGhpcy5fYnVpbGRlcnNTY2hlbWEpKSxcblxuXG4gICAgICAgIGNvbmNhdE1hcCgoYnVpbGRlck1hcCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGJ1aWxkZXJEZXNjcmlwdGlvbiA9IGJ1aWxkZXJNYXAuYnVpbGRlcnNbYnVpbGRlck5hbWVdO1xuXG4gICAgICAgICAgaWYgKCFidWlsZGVyRGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBCdWlsZGVyQ2Fubm90QmVSZXNvbHZlZEV4Y2VwdGlvbih0YXJnZXQuYnVpbGRlcik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gUmVzb2x2ZSBwYXRocyBpbiB0aGUgYnVpbGRlciBkZXNjcmlwdGlvbi5cbiAgICAgICAgICBjb25zdCBidWlsZGVySnNvbkRpciA9IGRpcm5hbWUoYnVpbGRlcnNKc29uUGF0aCk7XG4gICAgICAgICAgYnVpbGRlckRlc2NyaXB0aW9uLnNjaGVtYSA9IGpvaW4oYnVpbGRlckpzb25EaXIsIGJ1aWxkZXJEZXNjcmlwdGlvbi5zY2hlbWEpO1xuICAgICAgICAgIGJ1aWxkZXJEZXNjcmlwdGlvbi5jbGFzcyA9IGpvaW4oYnVpbGRlckpzb25EaXIsIGJ1aWxkZXJEZXNjcmlwdGlvbi5jbGFzcyk7XG5cbiAgICAgICAgICAvLyBWYWxpZGF0ZSBvcHRpb25zIGFnYWluIGJ1aWxkZXIgc2NoZW1hLlxuICAgICAgICAgIHJldHVybiBvZihidWlsZGVyRGVzY3JpcHRpb24pO1xuICAgICAgICB9KSxcbiAgICAgICkuc3Vic2NyaWJlKG9icyk7XG4gICAgfSk7XG4gIH1cblxuICB2YWxpZGF0ZUJ1aWxkZXJPcHRpb25zPE9wdGlvbnNUPihcbiAgICB0YXJnZXQ6IFRhcmdldDxPcHRpb25zVD4sIGJ1aWxkZXJEZXNjcmlwdGlvbjogQnVpbGRlckRlc2NyaXB0aW9uLFxuICApOiBPYnNlcnZhYmxlPE9wdGlvbnNUPiB7XG4gICAgcmV0dXJuIHRoaXMuX3ZhbGlkYXRlQWdhaW5zdFNjaGVtYTxPcHRpb25zVD4odGFyZ2V0Lm9wdGlvbnMsXG4gICAgICBub3JtYWxpemUoYnVpbGRlckRlc2NyaXB0aW9uLnNjaGVtYSkpO1xuICB9XG5cbiAgZ2V0QnVpbGRlcjxPcHRpb25zVD4oXG4gICAgYnVpbGRlckRlc2NyaXB0aW9uOiBCdWlsZGVyRGVzY3JpcHRpb24sIGNvbnRleHQ6IEJ1aWxkZXJDb250ZXh0LFxuICApOiBCdWlsZGVyPE9wdGlvbnNUPiB7XG4gICAgLy8gVE9ETzogc3VwcG9ydCBtb3JlIHRoYW4gdGhlIGRlZmF1bHQgZXhwb3J0LCBtYXliZSB2aWEgYnVpbGRlciNpbXBvcnQtbmFtZS5cbiAgICBjb25zdCBidWlsZGVyTW9kdWxlID0gcmVxdWlyZShnZXRTeXN0ZW1QYXRoKGJ1aWxkZXJEZXNjcmlwdGlvbi5jbGFzcykpO1xuICAgIGNvbnN0IGJ1aWxkZXJDbGFzcyA9IGJ1aWxkZXJNb2R1bGVbJ2RlZmF1bHQnXSBhcyBCdWlsZGVyQ29uc3RydWN0b3I8T3B0aW9uc1Q+O1xuXG4gICAgcmV0dXJuIG5ldyBidWlsZGVyQ2xhc3MoY29udGV4dCk7XG4gIH1cblxuICAvLyBXYXJuaW5nOiB0aGlzIG1ldGhvZCBjaGFuZ2VzIGNvbnRlbnRKc29uIGluIHBsYWNlLlxuICAvLyBUT0RPOiBhZGQgdHJhbnNmb3JtcyB0byByZXNvbHZlIHBhdGhzLlxuICBwcml2YXRlIF92YWxpZGF0ZUFnYWluc3RTY2hlbWE8VCA9IHt9Pihjb250ZW50SnNvbjoge30sIHNjaGVtYVBhdGg6IFBhdGgpOiBPYnNlcnZhYmxlPFQ+IHtcbiAgICBjb25zdCByZWdpc3RyeSA9IG5ldyBzY2hlbWEuQ29yZVNjaGVtYVJlZ2lzdHJ5KCk7XG5cbiAgICByZXR1cm4gdGhpcy5faG9zdC5yZWFkKHNjaGVtYVBhdGgpLnBpcGUoXG4gICAgICBjb25jYXRNYXAoKGJ1ZmZlcikgPT4gb2YoSlNPTi5wYXJzZSh2aXJ0dWFsRnMuZmlsZUJ1ZmZlclRvU3RyaW5nKGJ1ZmZlcikpKSksXG4gICAgICBjb25jYXRNYXAoKHNjaGVtYUNvbnRlbnQpID0+IHJlZ2lzdHJ5LmNvbXBpbGUoc2NoZW1hQ29udGVudCkpLFxuICAgICAgY29uY2F0TWFwKHZhbGlkYXRvciA9PiB2YWxpZGF0b3IoY29udGVudEpzb24pKSxcbiAgICAgIGNvbmNhdE1hcCh2YWxpZGF0b3JSZXN1bHQgPT4ge1xuICAgICAgICBpZiAodmFsaWRhdG9yUmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICByZXR1cm4gb2YoY29udGVudEpzb24gYXMgVCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIF90aHJvdyhuZXcgU2NoZW1hVmFsaWRhdGlvbkV4Y2VwdGlvbih2YWxpZGF0b3JSZXN1bHQuZXJyb3JzIGFzIHN0cmluZ1tdKSk7XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICk7XG4gIH1cbn1cbiJdfQ==