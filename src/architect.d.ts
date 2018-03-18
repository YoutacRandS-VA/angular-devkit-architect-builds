/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BaseException, JsonObject, Path, experimental } from '@angular-devkit/core';
import { Observable } from 'rxjs/Observable';
import { BuildEvent, Builder, BuilderContext, BuilderDescription } from './builder';
export declare class TargetNotFoundException extends BaseException {
    constructor(name: string);
}
export declare class ConfigurationNotFoundException extends BaseException {
    constructor(name: string);
}
export declare class BuilderCannotBeResolvedException extends BaseException {
    constructor(builder: string);
}
export declare class ArchitectNotYetLoadedException extends BaseException {
    constructor();
}
export declare class BuilderNotFoundException extends BaseException {
    constructor(builder: string);
}
export interface BuilderConfiguration<OptionsT = {}> {
    root: Path;
    projectType: string;
    builder: string;
    options: OptionsT;
}
export interface TargetSpecifier<OptionsT = {}> {
    project: string;
    target: string;
    configuration?: string;
    overrides?: Partial<OptionsT>;
}
export interface TargetsMap {
    [k: string]: Target;
}
export declare type TargetOptions<T = JsonObject> = T;
export declare type TargetConfiguration<T = JsonObject> = Partial<T>;
export interface Target<T = JsonObject> {
    builder: string;
    options: TargetOptions<T>;
    configurations?: {
        [k: string]: TargetConfiguration<T>;
    };
}
export declare class Architect {
    private _workspace;
    private readonly _targetsSchemaPath;
    private readonly _buildersSchemaPath;
    private _targetsSchema;
    private _buildersSchema;
    private _architectSchemasLoaded;
    private _builderPathsMap;
    private _builderDescriptionMap;
    private _builderConstructorMap;
    constructor(_workspace: experimental.workspace.Workspace);
    loadArchitect(): Observable<this>;
    getBuilderConfiguration<OptionsT>(targetSpec: TargetSpecifier): Observable<BuilderConfiguration<OptionsT>>;
    run<OptionsT>(builderConfig: BuilderConfiguration<OptionsT>, partialContext?: Partial<BuilderContext>): Observable<BuildEvent>;
    getBuilderDescription<OptionsT>(builderConfig: BuilderConfiguration<OptionsT>): Observable<BuilderDescription>;
    validateBuilderOptions<OptionsT>(builderConfig: BuilderConfiguration<OptionsT>, builderDescription: BuilderDescription): Observable<BuilderConfiguration<OptionsT>>;
    getBuilder<OptionsT>(builderDescription: BuilderDescription, context: BuilderContext): Builder<OptionsT>;
    private _loadJsonFile(path);
}
