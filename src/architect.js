"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const core_1 = require("@angular-devkit/core");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const api_1 = require("./api");
const schedule_by_name_1 = require("./schedule-by-name");
const inputSchema = require('./input-schema.json');
const outputSchema = require('./output-schema.json');
function _createJobHandlerFromBuilderInfo(info, target, host, registry, baseOptions) {
    const jobDescription = {
        name: target ? `{${api_1.targetStringFromTarget(target)}}` : info.builderName,
        argument: { type: 'object' },
        input: inputSchema,
        output: outputSchema,
        info,
    };
    function handler(argument, context) {
        const inboundBus = context.inboundBus.pipe(operators_1.concatMap(message => {
            if (message.kind === core_1.experimental.jobs.JobInboundMessageKind.Input) {
                const v = message.value;
                const options = Object.assign({}, baseOptions, v.options);
                // Validate v against the options schema.
                return registry.compile(info.optionSchema).pipe(operators_1.concatMap(validation => validation(options)), operators_1.map(result => {
                    if (result.success) {
                        return Object.assign({}, v, { options: result.data });
                    }
                    else if (result.errors) {
                        throw new Error('Options did not validate.' + result.errors.join());
                    }
                    else {
                        return v;
                    }
                }), operators_1.map(value => (Object.assign({}, message, { value }))));
            }
            else {
                return rxjs_1.of(message);
            }
        }), 
        // Using a share replay because the job might be synchronously sending input, but
        // asynchronously listening to it.
        operators_1.shareReplay(1));
        return rxjs_1.from(host.loadBuilder(info)).pipe(operators_1.concatMap(builder => {
            if (builder === null) {
                throw new Error(`Cannot load builder for builderInfo ${JSON.stringify(info, null, 2)}`);
            }
            return builder.handler(argument, Object.assign({}, context, { inboundBus })).pipe(operators_1.map(output => {
                if (output.kind === core_1.experimental.jobs.JobOutboundMessageKind.Output) {
                    // Add target to it.
                    return Object.assign({}, output, { value: Object.assign({}, output.value, target ? { target } : 0) });
                }
                else {
                    return output;
                }
            }));
        }));
    }
    return rxjs_1.of(Object.assign(handler, { jobDescription }));
}
/**
 * A JobRegistry that resolves builder targets from the host.
 */
class ArchitectBuilderJobRegistry {
    constructor(_host, _registry, _jobCache, _infoCache) {
        this._host = _host;
        this._registry = _registry;
        this._jobCache = _jobCache;
        this._infoCache = _infoCache;
    }
    _resolveBuilder(name) {
        const cache = this._infoCache;
        if (cache) {
            const maybeCache = cache.get(name);
            if (maybeCache !== undefined) {
                return maybeCache;
            }
            const info = rxjs_1.from(this._host.resolveBuilder(name)).pipe(operators_1.shareReplay(1));
            cache.set(name, info);
            return info;
        }
        return rxjs_1.from(this._host.resolveBuilder(name));
    }
    _createBuilder(info, target, options) {
        const cache = this._jobCache;
        if (target) {
            const maybeHit = cache && cache.get(api_1.targetStringFromTarget(target));
            if (maybeHit) {
                return maybeHit;
            }
        }
        else {
            const maybeHit = cache && cache.get(info.builderName);
            if (maybeHit) {
                return maybeHit;
            }
        }
        const result = _createJobHandlerFromBuilderInfo(info, target, this._host, this._registry, options || {});
        if (cache) {
            if (target) {
                cache.set(api_1.targetStringFromTarget(target), result.pipe(operators_1.shareReplay(1)));
            }
            else {
                cache.set(info.builderName, result.pipe(operators_1.shareReplay(1)));
            }
        }
        return result;
    }
    get(name) {
        const m = name.match(/^([^:]+):([^:]+)$/i);
        if (!m) {
            return rxjs_1.of(null);
        }
        return rxjs_1.from(this._resolveBuilder(name)).pipe(operators_1.concatMap(builderInfo => builderInfo ? this._createBuilder(builderInfo) : rxjs_1.of(null)), operators_1.first(null, null));
    }
}
exports.ArchitectBuilderJobRegistry = ArchitectBuilderJobRegistry;
/**
 * A JobRegistry that resolves targets from the host.
 */
class ArchitectTargetJobRegistry extends ArchitectBuilderJobRegistry {
    get(name) {
        const m = name.match(/^{([^:]+):([^:]+)(?::([^:]*))?}$/i);
        if (!m) {
            return rxjs_1.of(null);
        }
        const target = {
            project: m[1],
            target: m[2],
            configuration: m[3],
        };
        return rxjs_1.from(Promise.all([
            this._host.getBuilderNameForTarget(target),
            this._host.getOptionsForTarget(target),
        ])).pipe(operators_1.concatMap(([builderStr, options]) => {
            if (builderStr === null || options === null) {
                return rxjs_1.of(null);
            }
            return this._resolveBuilder(builderStr).pipe(operators_1.concatMap(builderInfo => {
                if (builderInfo === null) {
                    return rxjs_1.of(null);
                }
                return this._createBuilder(builderInfo, target, options);
            }));
        }), operators_1.first(null, null));
    }
}
exports.ArchitectTargetJobRegistry = ArchitectTargetJobRegistry;
class Architect {
    constructor(_host, _registry = new core_1.json.schema.CoreSchemaRegistry(), additionalJobRegistry) {
        this._host = _host;
        this._registry = _registry;
        this._jobCache = new Map();
        this._infoCache = new Map();
        const jobRegistry = new core_1.experimental.jobs.FallbackRegistry([
            new ArchitectTargetJobRegistry(_host, _registry, this._jobCache, this._infoCache),
            new ArchitectBuilderJobRegistry(_host, _registry, this._jobCache, this._infoCache),
            ...(additionalJobRegistry ? [additionalJobRegistry] : []),
        ]);
        this._scheduler = new core_1.experimental.jobs.SimpleScheduler(jobRegistry, _registry);
    }
    has(name) {
        return this._scheduler.has(name);
    }
    scheduleBuilder(name, options, scheduleOptions = {}) {
        if (!/^[^:]+:[^:]+$/.test(name)) {
            throw new Error('Invalid builder name: ' + JSON.stringify(name));
        }
        return schedule_by_name_1.scheduleByName(name, options, {
            scheduler: this._scheduler,
            logger: scheduleOptions.logger || new core_1.logging.NullLogger(),
            currentDirectory: this._host.getCurrentDirectory(),
            workspaceRoot: this._host.getWorkspaceRoot(),
        });
    }
    scheduleTarget(target, overrides = {}, scheduleOptions = {}) {
        return schedule_by_name_1.scheduleByTarget(target, overrides, {
            scheduler: this._scheduler,
            logger: scheduleOptions.logger || new core_1.logging.NullLogger(),
            currentDirectory: this._host.getCurrentDirectory(),
            workspaceRoot: this._host.getWorkspaceRoot(),
        });
    }
}
exports.Architect = Architect;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJjaGl0ZWN0LmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9hcmNoaXRlY3Qvc3JjL2FyY2hpdGVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILCtDQUFtRTtBQUNuRSwrQkFBNEM7QUFDNUMsOENBQW9FO0FBQ3BFLCtCQVFlO0FBRWYseURBQXNFO0FBRXRFLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQ25ELE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBRXJELFNBQVMsZ0NBQWdDLENBQ3ZDLElBQWlCLEVBQ2pCLE1BQTBCLEVBQzFCLElBQW1CLEVBQ25CLFFBQW9DLEVBQ3BDLFdBQTRCO0lBRTVCLE1BQU0sY0FBYyxHQUF1QjtRQUN6QyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLDRCQUFzQixDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXO1FBQ3ZFLFFBQVEsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7UUFDNUIsS0FBSyxFQUFFLFdBQVc7UUFDbEIsTUFBTSxFQUFFLFlBQVk7UUFDcEIsSUFBSTtLQUNMLENBQUM7SUFFRixTQUFTLE9BQU8sQ0FBQyxRQUF5QixFQUFFLE9BQTRDO1FBQ3RGLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUN4QyxxQkFBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ2xCLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxtQkFBWSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLEVBQUU7Z0JBQ2xFLE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxLQUFxQixDQUFDO2dCQUN4QyxNQUFNLE9BQU8scUJBQ1IsV0FBVyxFQUNYLENBQUMsQ0FBQyxPQUFPLENB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QUMsQ0FBQztJQUNMLENBQUM7SUFDRCxjQUFjLENBQ1osTUFBYyxFQUNkLFlBQTZCLEVBQUUsRUFDL0Isa0JBQW1DLEVBQUU7UUFFckMsT0FBTyxtQ0FBZ0IsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFO1lBQ3pDLFNBQVMsRUFBRSxJQUFJLENBQUMsVUFBVTtZQUMxQixNQUFNLEVBQUUsZUFBZSxDQUFDLE1BQU0sSUFBSSxJQUFJLGNBQU8sQ0FBQyxVQUFVLEVBQUU7WUFDMUQsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBRTtZQUNsRCxhQUFhLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRTtTQUM3QyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFuREQsOEJBbURDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHsgZXhwZXJpbWVudGFsLCBqc29uLCBsb2dnaW5nIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgZnJvbSwgb2YgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGNvbmNhdE1hcCwgZmlyc3QsIG1hcCwgc2hhcmVSZXBsYXkgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQge1xuICBCdWlsZGVySW5mbyxcbiAgQnVpbGRlcklucHV0LFxuICBCdWlsZGVyT3V0cHV0LFxuICBCdWlsZGVyUmVnaXN0cnksXG4gIEJ1aWxkZXJSdW4sXG4gIFRhcmdldCxcbiAgdGFyZ2V0U3RyaW5nRnJvbVRhcmdldCxcbn0gZnJvbSAnLi9hcGknO1xuaW1wb3J0IHsgQXJjaGl0ZWN0SG9zdCwgQnVpbGRlckRlc2NyaXB0aW9uLCBCdWlsZGVySm9iSGFuZGxlciB9IGZyb20gJy4vaW50ZXJuYWwnO1xuaW1wb3J0IHsgc2NoZWR1bGVCeU5hbWUsIHNjaGVkdWxlQnlUYXJnZXQgfSBmcm9tICcuL3NjaGVkdWxlLWJ5LW5hbWUnO1xuXG5jb25zdCBpbnB1dFNjaGVtYSA9IHJlcXVpcmUoJy4vaW5wdXQtc2NoZW1hLmpzb24nKTtcbmNvbnN0IG91dHB1dFNjaGVtYSA9IHJlcXVpcmUoJy4vb3V0cHV0LXNjaGVtYS5qc29uJyk7XG5cbmZ1bmN0aW9uIF9jcmVhdGVKb2JIYW5kbGVyRnJvbUJ1aWxkZXJJbmZvKFxuICBpbmZvOiBCdWlsZGVySW5mbyxcbiAgdGFyZ2V0OiBUYXJnZXQgfCB1bmRlZmluZWQsXG4gIGhvc3Q6IEFyY2hpdGVjdEhvc3QsXG4gIHJlZ2lzdHJ5OiBqc29uLnNjaGVtYS5TY2hlbWFSZWdpc3RyeSxcbiAgYmFzZU9wdGlvbnM6IGpzb24uSnNvbk9iamVjdCxcbik6IE9ic2VydmFibGU8QnVpbGRlckpvYkhhbmRsZXI+IHtcbiAgY29uc3Qgam9iRGVzY3JpcHRpb246IEJ1aWxkZXJEZXNjcmlwdGlvbiA9IHtcbiAgICBuYW1lOiB0YXJnZXQgPyBgeyR7dGFyZ2V0U3RyaW5nRnJvbVRhcmdldCh0YXJnZXQpfX1gIDogaW5mby5idWlsZGVyTmFtZSxcbiAgICBhcmd1bWVudDogeyB0eXBlOiAnb2JqZWN0JyB9LFxuICAgIGlucHV0OiBpbnB1dFNjaGVtYSxcbiAgICBvdXRwdXQ6IG91dHB1dFNjaGVtYSxcbiAgICBpbmZvLFxuICB9O1xuXG4gIGZ1bmN0aW9uIGhhbmRsZXIoYXJndW1lbnQ6IGpzb24uSnNvbk9iamVjdCwgY29udGV4dDogZXhwZXJpbWVudGFsLmpvYnMuSm9iSGFuZGxlckNvbnRleHQpIHtcbiAgICBjb25zdCBpbmJvdW5kQnVzID0gY29udGV4dC5pbmJvdW5kQnVzLnBpcGUoXG4gICAgICBjb25jYXRNYXAobWVzc2FnZSA9PiB7XG4gICAgICAgIGlmIChtZXNzYWdlLmtpbmQgPT09IGV4cGVyaW1lbnRhbC5qb2JzLkpvYkluYm91bmRNZXNzYWdlS2luZC5JbnB1dCkge1xuICAgICAgICAgIGNvbnN0IHYgPSBtZXNzYWdlLnZhbHVlIGFzIEJ1aWxkZXJJbnB1dDtcbiAgICAgICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICAgICAgLi4uYmFzZU9wdGlvbnMsXG4gICAgICAgICAgICAuLi52Lm9wdGlvbnMsXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIC8vIFZhbGlkYXRlIHYgYWdhaW5zdCB0aGUgb3B0aW9ucyBzY2hlbWEuXG4gICAgICAgICAgcmV0dXJuIHJlZ2lzdHJ5LmNvbXBpbGUoaW5mby5vcHRpb25TY2hlbWEpLnBpcGUoXG4gICAgICAgICAgICBjb25jYXRNYXAodmFsaWRhdGlvbiA9PiB2YWxpZGF0aW9uKG9wdGlvbnMpKSxcbiAgICAgICAgICAgIG1hcChyZXN1bHQgPT4ge1xuICAgICAgICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geyAuLi52LCBvcHRpb25zOiByZXN1bHQuZGF0YSB9IGFzIEJ1aWxkZXJJbnB1dDtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChyZXN1bHQuZXJyb3JzKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdPcHRpb25zIGRpZCBub3QgdmFsaWRhdGUuJyArIHJlc3VsdC5lcnJvcnMuam9pbigpKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBtYXAodmFsdWUgPT4gKHsgLi4ubWVzc2FnZSwgdmFsdWUgfSkpLFxuICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG9mKG1lc3NhZ2UgYXMgZXhwZXJpbWVudGFsLmpvYnMuSm9iSW5ib3VuZE1lc3NhZ2U8QnVpbGRlcklucHV0Pik7XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICAgLy8gVXNpbmcgYSBzaGFyZSByZXBsYXkgYmVjYXVzZSB0aGUgam9iIG1pZ2h0IGJlIHN5bmNocm9ub3VzbHkgc2VuZGluZyBpbnB1dCwgYnV0XG4gICAgICAvLyBhc3luY2hyb25vdXNseSBsaXN0ZW5pbmcgdG8gaXQuXG4gICAgICBzaGFyZVJlcGxheSgxKSxcbiAgICApO1xuXG4gICAgcmV0dXJuIGZyb20oaG9zdC5sb2FkQnVpbGRlcihpbmZvKSkucGlwZShcbiAgICAgIGNvbmNhdE1hcChidWlsZGVyID0+IHtcbiAgICAgICAgaWYgKGJ1aWxkZXIgPT09IG51bGwpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBsb2FkIGJ1aWxkZXIgZm9yIGJ1aWxkZXJJbmZvICR7SlNPTi5zdHJpbmdpZnkoaW5mbywgbnVsbCwgMil9YCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYnVpbGRlci5oYW5kbGVyKGFyZ3VtZW50LCB7IC4uLmNvbnRleHQsIGluYm91bmRCdXMgfSkucGlwZShcbiAgICAgICAgICBtYXAob3V0cHV0ID0+IHtcbiAgICAgICAgICAgIGlmIChvdXRwdXQua2luZCA9PT0gZXhwZXJpbWVudGFsLmpvYnMuSm9iT3V0Ym91bmRNZXNzYWdlS2luZC5PdXRwdXQpIHtcbiAgICAgICAgICAgICAgLy8gQWRkIHRhcmdldCB0byBpdC5cbiAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAuLi5vdXRwdXQsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHtcbiAgICAgICAgICAgICAgICAgIC4uLm91dHB1dC52YWx1ZSxcbiAgICAgICAgICAgICAgICAgIC4uLnRhcmdldCA/IHsgdGFyZ2V0IH0gOiAwLFxuICAgICAgICAgICAgICAgIH0gYXMganNvbi5Kc29uT2JqZWN0LFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KSxcbiAgICAgICAgKTtcbiAgICAgIH0pLFxuICAgICk7XG4gIH1cblxuICByZXR1cm4gb2YoT2JqZWN0LmFzc2lnbihoYW5kbGVyLCB7IGpvYkRlc2NyaXB0aW9uIH0pIGFzIEJ1aWxkZXJKb2JIYW5kbGVyKTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTY2hlZHVsZU9wdGlvbnMge1xuICBsb2dnZXI/OiBsb2dnaW5nLkxvZ2dlcjtcbn1cblxuXG4vKipcbiAqIEEgSm9iUmVnaXN0cnkgdGhhdCByZXNvbHZlcyBidWlsZGVyIHRhcmdldHMgZnJvbSB0aGUgaG9zdC5cbiAqL1xuZXhwb3J0IGNsYXNzIEFyY2hpdGVjdEJ1aWxkZXJKb2JSZWdpc3RyeSBpbXBsZW1lbnRzIEJ1aWxkZXJSZWdpc3RyeSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByb3RlY3RlZCBfaG9zdDogQXJjaGl0ZWN0SG9zdCxcbiAgICBwcm90ZWN0ZWQgX3JlZ2lzdHJ5OiBqc29uLnNjaGVtYS5TY2hlbWFSZWdpc3RyeSxcbiAgICBwcm90ZWN0ZWQgX2pvYkNhY2hlPzogTWFwPHN0cmluZywgT2JzZXJ2YWJsZTxCdWlsZGVySm9iSGFuZGxlciB8IG51bGw+PixcbiAgICBwcm90ZWN0ZWQgX2luZm9DYWNoZT86IE1hcDxzdHJpbmcsIE9ic2VydmFibGU8QnVpbGRlckluZm8gfCBudWxsPj4sXG4gICkge31cblxuICBwcm90ZWN0ZWQgX3Jlc29sdmVCdWlsZGVyKG5hbWU6IHN0cmluZyk6IE9ic2VydmFibGU8QnVpbGRlckluZm8gfCBudWxsPiB7XG4gICAgY29uc3QgY2FjaGUgPSB0aGlzLl9pbmZvQ2FjaGU7XG4gICAgaWYgKGNhY2hlKSB7XG4gICAgICBjb25zdCBtYXliZUNhY2hlID0gY2FjaGUuZ2V0KG5hbWUpO1xuICAgICAgaWYgKG1heWJlQ2FjaGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gbWF5YmVDYWNoZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgaW5mbyA9IGZyb20odGhpcy5faG9zdC5yZXNvbHZlQnVpbGRlcihuYW1lKSkucGlwZShcbiAgICAgICAgc2hhcmVSZXBsYXkoMSksXG4gICAgICApO1xuICAgICAgY2FjaGUuc2V0KG5hbWUsIGluZm8pO1xuXG4gICAgICByZXR1cm4gaW5mbztcbiAgICB9XG5cbiAgICByZXR1cm4gZnJvbSh0aGlzLl9ob3N0LnJlc29sdmVCdWlsZGVyKG5hbWUpKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBfY3JlYXRlQnVpbGRlcihcbiAgICBpbmZvOiBCdWlsZGVySW5mbyxcbiAgICB0YXJnZXQ/OiBUYXJnZXQsXG4gICAgb3B0aW9ucz86IGpzb24uSnNvbk9iamVjdCxcbiAgKTogT2JzZXJ2YWJsZTxCdWlsZGVySm9iSGFuZGxlciB8IG51bGw+IHtcbiAgICBjb25zdCBjYWNoZSA9IHRoaXMuX2pvYkNhY2hlO1xuICAgIGlmICh0YXJnZXQpIHtcbiAgICAgIGNvbnN0IG1heWJlSGl0ID0gY2FjaGUgJiYgY2FjaGUuZ2V0KHRhcmdldFN0cmluZ0Zyb21UYXJnZXQodGFyZ2V0KSk7XG4gICAgICBpZiAobWF5YmVIaXQpIHtcbiAgICAgICAgcmV0dXJuIG1heWJlSGl0O1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBtYXliZUhpdCA9IGNhY2hlICYmIGNhY2hlLmdldChpbmZvLmJ1aWxkZXJOYW1lKTtcbiAgICAgIGlmIChtYXliZUhpdCkge1xuICAgICAgICByZXR1cm4gbWF5YmVIaXQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdWx0ID0gX2NyZWF0ZUpvYkhhbmRsZXJGcm9tQnVpbGRlckluZm8oXG4gICAgICBpbmZvLFxuICAgICAgdGFyZ2V0LFxuICAgICAgdGhpcy5faG9zdCxcbiAgICAgIHRoaXMuX3JlZ2lzdHJ5LFxuICAgICAgb3B0aW9ucyB8fCB7fSxcbiAgICApO1xuXG4gICAgaWYgKGNhY2hlKSB7XG4gICAgICBpZiAodGFyZ2V0KSB7XG4gICAgICAgIGNhY2hlLnNldCh0YXJnZXRTdHJpbmdGcm9tVGFyZ2V0KHRhcmdldCksIHJlc3VsdC5waXBlKHNoYXJlUmVwbGF5KDEpKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYWNoZS5zZXQoaW5mby5idWlsZGVyTmFtZSwgcmVzdWx0LnBpcGUoc2hhcmVSZXBsYXkoMSkpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZ2V0PFxuICAgIEEgZXh0ZW5kcyBqc29uLkpzb25PYmplY3QsXG4gICAgSSBleHRlbmRzIEJ1aWxkZXJJbnB1dCxcbiAgICBPIGV4dGVuZHMgQnVpbGRlck91dHB1dCxcbiAgICA+KG5hbWU6IHN0cmluZyk6IE9ic2VydmFibGU8ZXhwZXJpbWVudGFsLmpvYnMuSm9iSGFuZGxlcjxBLCBJLCBPPiB8IG51bGw+IHtcbiAgICBjb25zdCBtID0gbmFtZS5tYXRjaCgvXihbXjpdKyk6KFteOl0rKSQvaSk7XG4gICAgaWYgKCFtKSB7XG4gICAgICByZXR1cm4gb2YobnVsbCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZyb20odGhpcy5fcmVzb2x2ZUJ1aWxkZXIobmFtZSkpLnBpcGUoXG4gICAgICBjb25jYXRNYXAoYnVpbGRlckluZm8gPT4gYnVpbGRlckluZm8gPyB0aGlzLl9jcmVhdGVCdWlsZGVyKGJ1aWxkZXJJbmZvKSA6IG9mKG51bGwpKSxcbiAgICAgIGZpcnN0KG51bGwsIG51bGwpLFxuICAgICkgYXMgT2JzZXJ2YWJsZTxleHBlcmltZW50YWwuam9icy5Kb2JIYW5kbGVyPEEsIEksIE8+IHwgbnVsbD47XG4gIH1cbn1cblxuLyoqXG4gKiBBIEpvYlJlZ2lzdHJ5IHRoYXQgcmVzb2x2ZXMgdGFyZ2V0cyBmcm9tIHRoZSBob3N0LlxuICovXG5leHBvcnQgY2xhc3MgQXJjaGl0ZWN0VGFyZ2V0Sm9iUmVnaXN0cnkgZXh0ZW5kcyBBcmNoaXRlY3RCdWlsZGVySm9iUmVnaXN0cnkge1xuICBnZXQ8XG4gICAgQSBleHRlbmRzIGpzb24uSnNvbk9iamVjdCxcbiAgICBJIGV4dGVuZHMgQnVpbGRlcklucHV0LFxuICAgIE8gZXh0ZW5kcyBCdWlsZGVyT3V0cHV0LFxuICAgID4obmFtZTogc3RyaW5nKTogT2JzZXJ2YWJsZTxleHBlcmltZW50YWwuam9icy5Kb2JIYW5kbGVyPEEsIEksIE8+IHwgbnVsbD4ge1xuICAgIGNvbnN0IG0gPSBuYW1lLm1hdGNoKC9eeyhbXjpdKyk6KFteOl0rKSg/OjooW146XSopKT99JC9pKTtcbiAgICBpZiAoIW0pIHtcbiAgICAgIHJldHVybiBvZihudWxsKTtcbiAgICB9XG5cbiAgICBjb25zdCB0YXJnZXQgPSB7XG4gICAgICBwcm9qZWN0OiBtWzFdLFxuICAgICAgdGFyZ2V0OiBtWzJdLFxuICAgICAgY29uZmlndXJhdGlvbjogbVszXSxcbiAgICB9O1xuXG4gICAgcmV0dXJuIGZyb20oUHJvbWlzZS5hbGwoW1xuICAgICAgdGhpcy5faG9zdC5nZXRCdWlsZGVyTmFtZUZvclRhcmdldCh0YXJnZXQpLFxuICAgICAgdGhpcy5faG9zdC5nZXRPcHRpb25zRm9yVGFyZ2V0KHRhcmdldCksXG4gICAgXSkpLnBpcGUoXG4gICAgICBjb25jYXRNYXAoKFtidWlsZGVyU3RyLCBvcHRpb25zXSkgPT4ge1xuICAgICAgICBpZiAoYnVpbGRlclN0ciA9PT0gbnVsbCB8fCBvcHRpb25zID09PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIG9mKG51bGwpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3Jlc29sdmVCdWlsZGVyKGJ1aWxkZXJTdHIpLnBpcGUoXG4gICAgICAgICAgY29uY2F0TWFwKGJ1aWxkZXJJbmZvID0+IHtcbiAgICAgICAgICAgIGlmIChidWlsZGVySW5mbyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICByZXR1cm4gb2YobnVsbCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVCdWlsZGVyKGJ1aWxkZXJJbmZvLCB0YXJnZXQsIG9wdGlvbnMpO1xuICAgICAgICAgIH0pLFxuICAgICAgICApO1xuICAgICAgfSksXG4gICAgICBmaXJzdChudWxsLCBudWxsKSxcbiAgICApIGFzIE9ic2VydmFibGU8ZXhwZXJpbWVudGFsLmpvYnMuSm9iSGFuZGxlcjxBLCBJLCBPPiB8IG51bGw+O1xuICB9XG59XG5cblxuZXhwb3J0IGNsYXNzIEFyY2hpdGVjdCB7XG4gIHByaXZhdGUgcmVhZG9ubHkgX3NjaGVkdWxlcjogZXhwZXJpbWVudGFsLmpvYnMuU2NoZWR1bGVyO1xuICBwcml2YXRlIHJlYWRvbmx5IF9qb2JDYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCBPYnNlcnZhYmxlPEJ1aWxkZXJKb2JIYW5kbGVyPj4oKTtcbiAgcHJpdmF0ZSByZWFkb25seSBfaW5mb0NhY2hlID0gbmV3IE1hcDxzdHJpbmcsIE9ic2VydmFibGU8QnVpbGRlckluZm8+PigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX2hvc3Q6IEFyY2hpdGVjdEhvc3QsXG4gICAgcHJpdmF0ZSBfcmVnaXN0cnk6IGpzb24uc2NoZW1hLlNjaGVtYVJlZ2lzdHJ5ID0gbmV3IGpzb24uc2NoZW1hLkNvcmVTY2hlbWFSZWdpc3RyeSgpLFxuICAgIGFkZGl0aW9uYWxKb2JSZWdpc3RyeT86IGV4cGVyaW1lbnRhbC5qb2JzLlJlZ2lzdHJ5LFxuICApIHtcbiAgICBjb25zdCBqb2JSZWdpc3RyeSA9IG5ldyBleHBlcmltZW50YWwuam9icy5GYWxsYmFja1JlZ2lzdHJ5KFtcbiAgICAgIG5ldyBBcmNoaXRlY3RUYXJnZXRKb2JSZWdpc3RyeShfaG9zdCwgX3JlZ2lzdHJ5LCB0aGlzLl9qb2JDYWNoZSwgdGhpcy5faW5mb0NhY2hlKSxcbiAgICAgIG5ldyBBcmNoaXRlY3RCdWlsZGVySm9iUmVnaXN0cnkoX2hvc3QsIF9yZWdpc3RyeSwgdGhpcy5fam9iQ2FjaGUsIHRoaXMuX2luZm9DYWNoZSksXG4gICAgICAuLi4oYWRkaXRpb25hbEpvYlJlZ2lzdHJ5ID8gW2FkZGl0aW9uYWxKb2JSZWdpc3RyeV0gOiBbXSksXG4gICAgXSBhcyBleHBlcmltZW50YWwuam9icy5SZWdpc3RyeVtdKTtcblxuICAgIHRoaXMuX3NjaGVkdWxlciA9IG5ldyBleHBlcmltZW50YWwuam9icy5TaW1wbGVTY2hlZHVsZXIoam9iUmVnaXN0cnksIF9yZWdpc3RyeSk7XG4gIH1cblxuICBoYXMobmFtZTogZXhwZXJpbWVudGFsLmpvYnMuSm9iTmFtZSkge1xuICAgIHJldHVybiB0aGlzLl9zY2hlZHVsZXIuaGFzKG5hbWUpO1xuICB9XG5cbiAgc2NoZWR1bGVCdWlsZGVyKFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBvcHRpb25zOiBqc29uLkpzb25PYmplY3QsXG4gICAgc2NoZWR1bGVPcHRpb25zOiBTY2hlZHVsZU9wdGlvbnMgPSB7fSxcbiAgKTogUHJvbWlzZTxCdWlsZGVyUnVuPiB7XG4gICAgaWYgKCEvXlteOl0rOlteOl0rJC8udGVzdChuYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGJ1aWxkZXIgbmFtZTogJyArIEpTT04uc3RyaW5naWZ5KG5hbWUpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2NoZWR1bGVCeU5hbWUobmFtZSwgb3B0aW9ucywge1xuICAgICAgc2NoZWR1bGVyOiB0aGlzLl9zY2hlZHVsZXIsXG4gICAgICBsb2dnZXI6IHNjaGVkdWxlT3B0aW9ucy5sb2dnZXIgfHwgbmV3IGxvZ2dpbmcuTnVsbExvZ2dlcigpLFxuICAgICAgY3VycmVudERpcmVjdG9yeTogdGhpcy5faG9zdC5nZXRDdXJyZW50RGlyZWN0b3J5KCksXG4gICAgICB3b3Jrc3BhY2VSb290OiB0aGlzLl9ob3N0LmdldFdvcmtzcGFjZVJvb3QoKSxcbiAgICB9KTtcbiAgfVxuICBzY2hlZHVsZVRhcmdldChcbiAgICB0YXJnZXQ6IFRhcmdldCxcbiAgICBvdmVycmlkZXM6IGpzb24uSnNvbk9iamVjdCA9IHt9LFxuICAgIHNjaGVkdWxlT3B0aW9uczogU2NoZWR1bGVPcHRpb25zID0ge30sXG4gICk6IFByb21pc2U8QnVpbGRlclJ1bj4ge1xuICAgIHJldHVybiBzY2hlZHVsZUJ5VGFyZ2V0KHRhcmdldCwgb3ZlcnJpZGVzLCB7XG4gICAgICBzY2hlZHVsZXI6IHRoaXMuX3NjaGVkdWxlcixcbiAgICAgIGxvZ2dlcjogc2NoZWR1bGVPcHRpb25zLmxvZ2dlciB8fCBuZXcgbG9nZ2luZy5OdWxsTG9nZ2VyKCksXG4gICAgICBjdXJyZW50RGlyZWN0b3J5OiB0aGlzLl9ob3N0LmdldEN1cnJlbnREaXJlY3RvcnkoKSxcbiAgICAgIHdvcmtzcGFjZVJvb3Q6IHRoaXMuX2hvc3QuZ2V0V29ya3NwYWNlUm9vdCgpLFxuICAgIH0pO1xuICB9XG59XG4iXX0=