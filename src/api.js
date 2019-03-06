"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const progress_schema_1 = require("./progress-schema");
exports.BuilderProgressState = progress_schema_1.State;
/**
 * Returns a string of "project:target[:configuration]" for the target object.
 */
function targetStringFromTarget({ project, target, configuration }) {
    return `${project}:${target}${configuration !== undefined ? ':' + configuration : ''}`;
}
exports.targetStringFromTarget = targetStringFromTarget;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9hbmd1bGFyX2RldmtpdC9hcmNoaXRlY3Qvc3JjL2FwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVdBLHVEQUFpRztBQUkvRiwrQkFKK0MsdUJBQW9CLENBSS9DO0FBeU90Qjs7R0FFRztBQUNILFNBQWdCLHNCQUFzQixDQUFDLEVBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQVM7SUFDN0UsT0FBTyxHQUFHLE9BQU8sSUFBSSxNQUFNLEdBQUcsYUFBYSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDekYsQ0FBQztBQUZELHdEQUVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHsgZXhwZXJpbWVudGFsLCBqc29uLCBsb2dnaW5nIH0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgU2NoZW1hIGFzIFJlYWxCdWlsZGVySW5wdXQsIFRhcmdldCBhcyBSZWFsVGFyZ2V0IH0gZnJvbSAnLi9pbnB1dC1zY2hlbWEnO1xuaW1wb3J0IHsgU2NoZW1hIGFzIFJlYWxCdWlsZGVyT3V0cHV0IH0gZnJvbSAnLi9vdXRwdXQtc2NoZW1hJztcbmltcG9ydCB7IFNjaGVtYSBhcyBSZWFsQnVpbGRlclByb2dyZXNzLCBTdGF0ZSBhcyBCdWlsZGVyUHJvZ3Jlc3NTdGF0ZSB9IGZyb20gJy4vcHJvZ3Jlc3Mtc2NoZW1hJztcblxuZXhwb3J0IHR5cGUgVGFyZ2V0ID0ganNvbi5Kc29uT2JqZWN0ICYgUmVhbFRhcmdldDtcbmV4cG9ydCB7XG4gIEJ1aWxkZXJQcm9ncmVzc1N0YXRlLFxufTtcblxuLy8gVHlwZSBzaG9ydCBoYW5kcy5cbmV4cG9ydCB0eXBlIEJ1aWxkZXJSZWdpc3RyeSA9XG4gIGV4cGVyaW1lbnRhbC5qb2JzLlJlZ2lzdHJ5PGpzb24uSnNvbk9iamVjdCwgQnVpbGRlcklucHV0LCBCdWlsZGVyT3V0cHV0PjtcblxuXG4vKipcbiAqIEFuIEFQSSB0eXBlZCBCdWlsZGVyUHJvZ3Jlc3MuIFRoZSBpbnRlcmZhY2UgZ2VuZXJhdGVkIGZyb20gdGhlIHNjaGVtYSBpcyB0b28gcGVybWlzc2l2ZSxcbiAqIHNvIHRoaXMgQVBJIGlzIHRoZSBvbmUgd2Ugc2hvdyBpbiBvdXIgQVBJLiBQbGVhc2Ugbm90ZSB0aGF0IG5vdCBhbGwgZmllbGRzIGFyZSBpbiB0aGVyZTsgdGhpc1xuICogaXMgaW4gYWRkaXRpb24gdG8gZmllbGRzIGluIHRoZSBzY2hlbWEuXG4gKi9cbmV4cG9ydCB0eXBlIFR5cGVkQnVpbGRlclByb2dyZXNzID0gKFxuICAgIHsgc3RhdGU6IEJ1aWxkZXJQcm9ncmVzc1N0YXRlLlN0b3BwZWQ7IH1cbiAgfCB7IHN0YXRlOiBCdWlsZGVyUHJvZ3Jlc3NTdGF0ZS5FcnJvcjsgZXJyb3I6IGpzb24uSnNvblZhbHVlOyB9XG4gIHwgeyBzdGF0ZTogQnVpbGRlclByb2dyZXNzU3RhdGUuV2FpdGluZzsgc3RhdHVzPzogc3RyaW5nOyB9XG4gIHwgeyBzdGF0ZTogQnVpbGRlclByb2dyZXNzU3RhdGUuUnVubmluZzsgc3RhdHVzPzogc3RyaW5nOyBjdXJyZW50OiBudW1iZXI7IHRvdGFsPzogbnVtYmVyOyB9XG4pO1xuXG4vKipcbiAqIERlY2xhcmF0aW9uIG9mIHRob3NlIHR5cGVzIGFzIEpzb25PYmplY3QgY29tcGF0aWJsZS4gSnNvbk9iamVjdCBpcyBub3QgY29tcGF0aWJsZSB3aXRoXG4gKiBvcHRpb25hbCBtZW1iZXJzLCBzbyB0aG9zZSB3b3VsZG4ndCBiZSBkaXJlY3RseSBhc3NpZ25hYmxlIHRvIG91ciBpbnRlcm5hbCBKc29uIHR5cGluZ3MuXG4gKiBGb3JjaW5nIHRoZSB0eXBlIHRvIGJlIGJvdGggYSBKc29uT2JqZWN0IGFuZCB0aGUgdHlwZSBmcm9tIHRoZSBTY2hlbWEgdGVsbHMgVHlwZXNjcmlwdCB0aGV5XG4gKiBhcmUgY29tcGF0aWJsZSAod2hpY2ggdGhleSBhcmUpLlxuICogVGhlc2UgdHlwZXMgc2hvdWxkIGJlIHVzZWQgZXZlcnl3aGVyZS5cbiAqL1xuZXhwb3J0IHR5cGUgQnVpbGRlcklucHV0ID0ganNvbi5Kc29uT2JqZWN0ICYgUmVhbEJ1aWxkZXJJbnB1dDtcbmV4cG9ydCB0eXBlIEJ1aWxkZXJPdXRwdXQgPSBqc29uLkpzb25PYmplY3QgJiBSZWFsQnVpbGRlck91dHB1dDtcbmV4cG9ydCB0eXBlIEJ1aWxkZXJQcm9ncmVzcyA9IGpzb24uSnNvbk9iamVjdCAmIFJlYWxCdWlsZGVyUHJvZ3Jlc3MgJiBUeXBlZEJ1aWxkZXJQcm9ncmVzcztcblxuLyoqXG4gKiBBIHByb2dyZXNzIHJlcG9ydCBpcyB3aGF0IHRoZSB0b29saW5nIHdpbGwgcmVjZWl2ZS4gSXQgY29udGFpbnMgdGhlIGJ1aWxkZXIgaW5mbyBhbmQgdGhlIHRhcmdldC5cbiAqIEFsdGhvdWdoIHRoZXNlIGFyZSBzZXJpYWxpemFibGUsIHRoZXkgYXJlIG9ubHkgZXhwb3NlZCB0aHJvdWdoIHRoZSB0b29saW5nIGludGVyZmFjZSwgbm90IHRoZVxuICogYnVpbGRlciBpbnRlcmZhY2UuIFRoZSB3YXRjaCBkb2cgc2VuZHMgQnVpbGRlclByb2dyZXNzIGFuZCB0aGUgQnVpbGRlciBoYXMgYSBzZXQgb2YgZnVuY3Rpb25zXG4gKiB0byBtYW5hZ2UgdGhlIHN0YXRlLlxuICovXG5leHBvcnQgdHlwZSBCdWlsZGVyUHJvZ3Jlc3NSZXBvcnQgPSBCdWlsZGVyUHJvZ3Jlc3MgJiAoe1xuICB0YXJnZXQ/OiBUYXJnZXQ7XG4gIGJ1aWxkZXI6IEJ1aWxkZXJJbmZvO1xufSk7XG5cbi8qKlxuICogQSBSdW4sIHdoaWNoIGlzIHdoYXQgaXMgcmV0dXJuZWQgYnkgc2NoZWR1bGVCdWlsZGVyIG9yIHNjaGVkdWxlVGFyZ2V0IGZ1bmN0aW9ucy4gVGhpcyBzaG91bGRcbiAqIGJlIHJlY29uc3RydWN0ZWQgYWNyb3NzIG1lbW9yeSBib3VuZGFyaWVzIChpdCdzIG5vdCBzZXJpYWxpemFibGUgYnV0IGFsbCBpbnRlcm5hbCBpbmZvcm1hdGlvblxuICogYXJlKS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBCdWlsZGVyUnVuIHtcbiAgLyoqXG4gICAqIFVuaXF1ZSBhbW9uZ3N0IHJ1bnMuIFRoaXMgaXMgdGhlIHNhbWUgSUQgYXMgdGhlIGNvbnRleHQgZ2VuZXJhdGVkIGZvciB0aGUgcnVuLiBJdCBjYW4gYmVcbiAgICogdXNlZCB0byBpZGVudGlmeSBtdWx0aXBsZSB1bmlxdWUgcnVucy4gVGhlcmUgaXMgbm8gZ3VhcmFudGVlIHRoYXQgYSBydW4gaXMgYSBzaW5nbGUgb3V0cHV0O1xuICAgKiBhIGJ1aWxkZXIgY2FuIHJlYnVpbGQgb24gaXRzIG93biBhbmQgd2lsbCBnZW5lcmF0ZSBtdWx0aXBsZSBvdXRwdXRzLlxuICAgKi9cbiAgaWQ6IG51bWJlcjtcblxuICAvKipcbiAgICogVGhlIGJ1aWxkZXIgaW5mb3JtYXRpb24uXG4gICAqL1xuICBpbmZvOiBCdWlsZGVySW5mbztcblxuICAvKipcbiAgICogVGhlIG5leHQgb3V0cHV0IGZyb20gYSBidWlsZGVyLiBUaGlzIGlzIHJlY29tbWVuZGVkIHdoZW4gc2NoZWR1bGluZyBhIGJ1aWxkZXIgYW5kIG9ubHkgYmVpbmdcbiAgICogaW50ZXJlc3RlZCBpbiB0aGUgcmVzdWx0IG9mIHRoYXQgc2luZ2xlIHJ1biwgbm90IG9mIGEgd2F0Y2gtbW9kZSBidWlsZGVyLlxuICAgKi9cbiAgcmVzdWx0OiBQcm9taXNlPEJ1aWxkZXJPdXRwdXQ+O1xuXG4gIC8qKlxuICAgKiBUaGUgb3V0cHV0KHMpIGZyb20gdGhlIGJ1aWxkZXIuIEEgYnVpbGRlciBjYW4gaGF2ZSBtdWx0aXBsZSBvdXRwdXRzLlxuICAgKiBUaGlzIGFsd2F5cyByZXBsYXkgdGhlIGxhc3Qgb3V0cHV0IHdoZW4gc3Vic2NyaWJlZC5cbiAgICovXG4gIG91dHB1dDogT2JzZXJ2YWJsZTxCdWlsZGVyT3V0cHV0PjtcblxuICAvKipcbiAgICogVGhlIHByb2dyZXNzIHJlcG9ydC4gQSBwcm9ncmVzcyBhbHNvIGNvbnRhaW5zIGFuIElELCB3aGljaCBjYW4gYmUgZGlmZmVyZW50IHRoYW4gdGhpcyBydW4nc1xuICAgKiBJRCAoaWYgdGhlIGJ1aWxkZXIgY2FsbHMgc2NoZWR1bGVCdWlsZGVyIG9yIHNjaGVkdWxlVGFyZ2V0KS5cbiAgICogVGhpcyB3aWxsIGFsd2F5cyByZXBsYXkgdGhlIGxhc3QgcHJvZ3Jlc3Mgb24gbmV3IHN1YnNjcmlwdGlvbnMuXG4gICAqL1xuICBwcm9ncmVzczogT2JzZXJ2YWJsZTxCdWlsZGVyUHJvZ3Jlc3NSZXBvcnQ+O1xuXG4gIC8qKlxuICAgKiBTdG9wIHRoZSBidWlsZGVyIGZyb20gcnVubmluZy4gUmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRoZSBidWlsZGVyIGlzIHN0b3BwZWQuXG4gICAqIFNvbWUgYnVpbGRlcnMgbWlnaHQgbm90IGhhbmRsZSBzdG9wcGluZyBwcm9wZXJseSBhbmQgc2hvdWxkIGhhdmUgYSB0aW1lb3V0IGhlcmUuXG4gICAqL1xuICBzdG9wKCk6IFByb21pc2U8dm9pZD47XG59XG5cbi8qKlxuICogQWRkaXRpb25hbCBvcHRpb25hbCBzY2hlZHVsaW5nIG9wdGlvbnMuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2NoZWR1bGVPcHRpb25zIHtcbiAgLyoqXG4gICAqIExvZ2dlciB0byBwYXNzIHRvIHRoZSBidWlsZGVyLiBOb3RlIHRoYXQgbWVzc2FnZXMgd2lsbCBzdG9wIGJlaW5nIGZvcndhcmRlZCwgYW5kIGlmIHlvdSB3YW50XG4gICAqIHRvIGxvZyBhIGJ1aWxkZXIgc2NoZWR1bGVkIGZyb20geW91ciBidWlsZGVyIHlvdSBzaG91bGQgZm9yd2FyZCBsb2cgZXZlbnRzIHlvdXJzZWxmLlxuICAgKi9cbiAgbG9nZ2VyPzogbG9nZ2luZy5Mb2dnZXI7XG59XG5cbi8qKlxuICogVGhlIGNvbnRleHQgcmVjZWl2ZWQgYXMgYSBzZWNvbmQgYXJndW1lbnQgaW4geW91ciBidWlsZGVyLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEJ1aWxkZXJDb250ZXh0IHtcbiAgLyoqXG4gICAqIFVuaXF1ZSBhbW9uZ3N0IGNvbnRleHRzLiBDb250ZXh0cyBpbnN0YW5jZXMgYXJlIG5vdCBndWFyYW50ZWVkIHRvIGJlIHRoZSBzYW1lIChidXQgaXQgY291bGRcbiAgICogYmUgdGhlIHNhbWUgY29udGV4dCksIGFuZCBhbGwgdGhlIGZpZWxkcyBpbiBhIGNvbnRleHQgY291bGQgYmUgdGhlIHNhbWUsIHlldCB0aGUgYnVpbGRlcidzXG4gICAqIGNvbnRleHQgY291bGQgYmUgZGlmZmVyZW50LiBUaGlzIGlzIHRoZSBzYW1lIElEIGFzIHRoZSBjb3JyZXNwb25kaW5nIHJ1bi5cbiAgICovXG4gIGlkOiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFRoZSBidWlsZGVyIGluZm8gdGhhdCBjYWxsZWQgeW91ciBmdW5jdGlvbi4gU2luY2UgdGhlIGJ1aWxkZXIgaW5mbyBpcyBmcm9tIHRoZSBidWlsZGVyLmpzb25cbiAgICogKG9yIHRoZSBob3N0KSwgaXQgY291bGQgY29udGFpbiBpbmZvcm1hdGlvbiB0aGF0IGlzIGRpZmZlcmVudCB0aGFuIGV4cGVjdGVkLlxuICAgKi9cbiAgYnVpbGRlcjogQnVpbGRlckluZm87XG5cbiAgLyoqXG4gICAqIEEgbG9nZ2VyIHRoYXQgYXBwZW5kcyBtZXNzYWdlcyB0byBhIGxvZy4gVGhpcyBjb3VsZCBiZSBhIHNlcGFyYXRlIGludGVyZmFjZSBvciBjb21wbGV0ZWx5XG4gICAqIGlnbm9yZWQuIGBjb25zb2xlLmxvZ2AgY291bGQgYWxzbyBiZSBjb21wbGV0ZWx5IGlnbm9yZWQuXG4gICAqL1xuICBsb2dnZXI6IGxvZ2dpbmcuTG9nZ2VyQXBpO1xuXG4gIC8qKlxuICAgKiBUaGUgYWJzb2x1dGUgd29ya3NwYWNlIHJvb3Qgb2YgdGhpcyBydW4uIFRoaXMgaXMgYSBzeXN0ZW0gcGF0aCBhbmQgd2lsbCBub3QgYmUgbm9ybWFsaXplZDtcbiAgICogaWUuIG9uIFdpbmRvd3MgaXQgd2lsbCBzdGFydHMgd2l0aCBgQzpcXFxcYCAob3Igd2hhdGV2ZXIgZHJpdmUpLlxuICAgKi9cbiAgd29ya3NwYWNlUm9vdDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgY3VycmVudCBkaXJlY3RvcnkgdGhlIHVzZXIgaXMgaW4uIFRoaXMgY291bGQgYmUgb3V0c2lkZSB0aGUgd29ya3NwYWNlIHJvb3QuIFRoaXMgaXMgYVxuICAgKiBzeXN0ZW0gcGF0aCBhbmQgd2lsbCBub3QgYmUgbm9ybWFsaXplZDsgaWUuIG9uIFdpbmRvd3MgaXQgd2lsbCBzdGFydHMgd2l0aCBgQzpcXFxcYCAob3JcbiAgICogd2hhdGV2ZXIgZHJpdmUpLlxuICAgKi9cbiAgY3VycmVudERpcmVjdG9yeTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgdGFyZ2V0IHRoYXQgd2FzIHVzZWQgdG8gcnVuIHRoaXMgYnVpbGRlci5cbiAgICogVGFyZ2V0IGlzIG9wdGlvbmFsIGlmIGEgYnVpbGRlciB3YXMgcmFuIHVzaW5nIGBzY2hlZHVsZUJ1aWxkZXIoKWAuXG4gICAqL1xuICB0YXJnZXQ/OiBUYXJnZXQ7XG5cbiAgLyoqXG4gICAqIFNjaGVkdWxlIGEgdGFyZ2V0IGluIHRoZSBzYW1lIHdvcmtzcGFjZS4gVGhpcyBjYW4gYmUgdGhlIHNhbWUgdGFyZ2V0IHRoYXQgaXMgYmVpbmcgZXhlY3V0ZWRcbiAgICogcmlnaHQgbm93LCBidXQgdGFyZ2V0cyBvZiB0aGUgc2FtZSBuYW1lIGFyZSBzZXJpYWxpemVkLlxuICAgKiBSdW5uaW5nIHRoZSBzYW1lIHRhcmdldCBhbmQgd2FpdGluZyBmb3IgaXQgdG8gZW5kIHdpbGwgcmVzdWx0IGluIGEgZGVhZGxvY2tpbmcgc2NlbmFyaW8uXG4gICAqIFRhcmdldHMgYXJlIGNvbnNpZGVyZWQgdGhlIHNhbWUgaWYgdGhlIHByb2plY3QsIHRoZSB0YXJnZXQgQU5EIHRoZSBjb25maWd1cmF0aW9uIGFyZSB0aGUgc2FtZS5cbiAgICogQHBhcmFtIHRhcmdldCBUaGUgdGFyZ2V0IHRvIHNjaGVkdWxlLlxuICAgKiBAcGFyYW0gb3ZlcnJpZGVzIEEgc2V0IG9mIG9wdGlvbnMgdG8gb3ZlcnJpZGUgdGhlIHdvcmtzcGFjZSBzZXQgb2Ygb3B0aW9ucy5cbiAgICogQHBhcmFtIHNjaGVkdWxlT3B0aW9ucyBBZGRpdGlvbmFsIG9wdGlvbmFsIHNjaGVkdWxpbmcgb3B0aW9ucy5cbiAgICogQHJldHVybiBBIHByb21pc2Ugb2YgYSBydW4uIEl0IHdpbGwgcmVzb2x2ZSB3aGVuIGFsbCB0aGUgbWVtYmVycyBvZiB0aGUgcnVuIGFyZSBhdmFpbGFibGUuXG4gICAqL1xuICBzY2hlZHVsZVRhcmdldChcbiAgICB0YXJnZXQ6IFRhcmdldCxcbiAgICBvdmVycmlkZXM/OiBqc29uLkpzb25PYmplY3QsXG4gICAgc2NoZWR1bGVPcHRpb25zPzogU2NoZWR1bGVPcHRpb25zLFxuICApOiBQcm9taXNlPEJ1aWxkZXJSdW4+O1xuXG4gIC8qKlxuICAgKiBTY2hlZHVsZSBhIGJ1aWxkZXIgYnkgaXRzIG5hbWUuIFRoaXMgY2FuIGJlIHRoZSBzYW1lIGJ1aWxkZXIgdGhhdCBpcyBiZWluZyBleGVjdXRlZC5cbiAgICogQHBhcmFtIGJ1aWxkZXJOYW1lIFRoZSBuYW1lIG9mIHRoZSBidWlsZGVyLCBpZS4gaXRzIGBwYWNrYWdlTmFtZTpidWlsZGVyTmFtZWAgdHVwbGUuXG4gICAqIEBwYXJhbSBvcHRpb25zIEFsbCBvcHRpb25zIHRvIHVzZSBmb3IgdGhlIGJ1aWxkZXIgKGJ5IGRlZmF1bHQgZW1wdHkgb2JqZWN0KS4gVGhlcmUgaXMgbm9cbiAgICogICAgIGFkZGl0aW9uYWwgb3B0aW9ucyBhZGRlZCwgZS5nLiBmcm9tIHRoZSB3b3Jrc3BhY2UuXG4gICAqIEBwYXJhbSBzY2hlZHVsZU9wdGlvbnMgQWRkaXRpb25hbCBvcHRpb25hbCBzY2hlZHVsaW5nIG9wdGlvbnMuXG4gICAqIEByZXR1cm4gQSBwcm9taXNlIG9mIGEgcnVuLiBJdCB3aWxsIHJlc29sdmUgd2hlbiBhbGwgdGhlIG1lbWJlcnMgb2YgdGhlIHJ1biBhcmUgYXZhaWxhYmxlLlxuICAgKi9cbiAgc2NoZWR1bGVCdWlsZGVyKFxuICAgIGJ1aWxkZXJOYW1lOiBzdHJpbmcsXG4gICAgb3B0aW9ucz86IGpzb24uSnNvbk9iamVjdCxcbiAgICBzY2hlZHVsZU9wdGlvbnM/OiBTY2hlZHVsZU9wdGlvbnMsXG4gICk6IFByb21pc2U8QnVpbGRlclJ1bj47XG5cbiAgLyoqXG4gICAqIFJlc29sdmUgYW5kIHJldHVybiBvcHRpb25zIGZvciBhIHNwZWNpZmllZCB0YXJnZXQuIElmIHRoZSB0YXJnZXQgaXNuJ3QgZGVmaW5lZCBpbiB0aGVcbiAgICogd29ya3NwYWNlIHRoaXMgd2lsbCByZWplY3QgdGhlIHByb21pc2UuIFRoaXMgb2JqZWN0IHdpbGwgYmUgcmVhZCBkaXJlY3RseSBmcm9tIHRoZSB3b3Jrc3BhY2VcbiAgICogYnV0IG5vdCB2YWxpZGF0ZWQgYWdhaW5zdCB0aGUgYnVpbGRlciBvZiB0aGUgdGFyZ2V0LlxuICAgKiBAcGFyYW0gdGFyZ2V0IFRoZSB0YXJnZXQgdG8gcmVzb2x2ZSB0aGUgb3B0aW9ucyBvZi5cbiAgICogQHJldHVybiBBIG5vbi12YWxpZGF0ZWQgb2JqZWN0IHJlc29sdmVkIGZyb20gdGhlIHdvcmtzcGFjZS5cbiAgICovXG4gIGdldFRhcmdldE9wdGlvbnModGFyZ2V0OiBUYXJnZXQpOiBQcm9taXNlPGpzb24uSnNvbk9iamVjdD47XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgYnVpbGRlciB0byBydW5uaW5nLiBUaGlzIHNob3VsZCBiZSB1c2VkIGlmIGFuIGV4dGVybmFsIGV2ZW50IHRyaWdnZXJlZCBhIHJlLXJ1bixcbiAgICogZS5nLiBhIGZpbGUgd2F0Y2hlZCB3YXMgY2hhbmdlZC5cbiAgICovXG4gIHJlcG9ydFJ1bm5pbmcoKTogdm9pZDtcblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBzdGF0dXMgc3RyaW5nIHNob3duIG9uIHRoZSBpbnRlcmZhY2UuXG4gICAqIEBwYXJhbSBzdGF0dXMgVGhlIHN0YXR1cyB0byBzZXQgaXQgdG8uIEFuIGVtcHR5IHN0cmluZyBjYW4gYmUgdXNlZCB0byByZW1vdmUgdGhlIHN0YXR1cy5cbiAgICovXG4gIHJlcG9ydFN0YXR1cyhzdGF0dXM6IHN0cmluZyk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgcHJvZ3Jlc3MgZm9yIHRoaXMgYnVpbGRlciBydW4uXG4gICAqIEBwYXJhbSBjdXJyZW50IFRoZSBjdXJyZW50IHByb2dyZXNzLiBUaGlzIHdpbGwgYmUgYmV0d2VlbiAwIGFuZCB0b3RhbC5cbiAgICogQHBhcmFtIHRvdGFsIEEgbmV3IHRvdGFsIHRvIHNldC4gQnkgZGVmYXVsdCBhdCB0aGUgc3RhcnQgb2YgYSBydW4gdGhpcyBpcyAxLiBJZiBvbWl0dGVkIGl0XG4gICAqICAgICB3aWxsIHVzZSB0aGUgc2FtZSB2YWx1ZSBhcyB0aGUgbGFzdCB0b3RhbC5cbiAgICogQHBhcmFtIHN0YXR1cyBVcGRhdGUgdGhlIHN0YXR1cyBzdHJpbmcuIElmIG9taXR0ZWQgdGhlIHN0YXR1cyBzdHJpbmcgaXMgbm90IG1vZGlmaWVkLlxuICAgKi9cbiAgcmVwb3J0UHJvZ3Jlc3MoY3VycmVudDogbnVtYmVyLCB0b3RhbD86IG51bWJlciwgc3RhdHVzPzogc3RyaW5nKTogdm9pZDtcbn1cblxuXG4vKipcbiAqIEFuIGFjY2VwdGVkIHJldHVybiB2YWx1ZSBmcm9tIGEgYnVpbGRlci4gQ2FuIGJlIGVpdGhlciBhbiBPYnNlcnZhYmxlLCBhIFByb21pc2Ugb3IgYSB2ZWN0b3IuXG4gKi9cbmV4cG9ydCB0eXBlIEJ1aWxkZXJPdXRwdXRMaWtlID0gT2JzZXJ2YWJsZTxCdWlsZGVyT3V0cHV0PiB8IFByb21pc2U8QnVpbGRlck91dHB1dD4gfCBCdWlsZGVyT3V0cHV0O1xuXG5cbi8qKlxuICogQSBidWlsZGVyIGhhbmRsZXIgZnVuY3Rpb24uIFRoZSBmdW5jdGlvbiBzaWduYXR1cmUgcGFzc2VkIHRvIGBjcmVhdGVCdWlsZGVyKClgLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEJ1aWxkZXJIYW5kbGVyRm48QSBleHRlbmRzIGpzb24uSnNvbk9iamVjdD4ge1xuICAvKipcbiAgICogQnVpbGRlcnMgYXJlIGRlZmluZWQgYnkgdXNlcnMgdG8gcGVyZm9ybSBhbnkga2luZCBvZiB0YXNrLCBsaWtlIGJ1aWxkaW5nLCB0ZXN0aW5nIG9yIGxpbnRpbmcsXG4gICAqIGFuZCBzaG91bGQgdXNlIHRoaXMgaW50ZXJmYWNlLlxuICAgKiBAcGFyYW0gaW5wdXQgVGhlIG9wdGlvbnMgKGEgSnNvbk9iamVjdCksIHZhbGlkYXRlZCBieSB0aGUgc2NoZW1hIGFuZCByZWNlaXZlZCBieSB0aGVcbiAgICogICAgIGJ1aWxkZXIuIFRoaXMgY2FuIGluY2x1ZGUgcmVzb2x2ZWQgb3B0aW9ucyBmcm9tIHRoZSBDTEkgb3IgdGhlIHdvcmtzcGFjZS5cbiAgICogQHBhcmFtIGNvbnRleHQgQSBjb250ZXh0IHRoYXQgY2FuIGJlIHVzZWQgdG8gaW50ZXJhY3Qgd2l0aCB0aGUgQXJjaGl0ZWN0IGZyYW1ld29yay5cbiAgICogQHJldHVybiBPbmUgb3IgbWFueSBidWlsZGVyIG91dHB1dC5cbiAgICovXG4gIChpbnB1dDogQSwgY29udGV4dDogQnVpbGRlckNvbnRleHQpOiBCdWlsZGVyT3V0cHV0TGlrZTtcbn1cblxuLyoqXG4gKiBBIEJ1aWxkZXIgZ2VuZXJhbCBpbmZvcm1hdGlvbi4gVGhpcyBpcyBnZW5lcmF0ZWQgYnkgdGhlIGhvc3QgYW5kIGlzIGV4cGFuZGVkIGJ5IHRoZSBob3N0LCBidXRcbiAqIHRoZSBwdWJsaWMgQVBJIGNvbnRhaW5zIHRob3NlIGZpZWxkcy5cbiAqL1xuZXhwb3J0IHR5cGUgQnVpbGRlckluZm8gPSBqc29uLkpzb25PYmplY3QgJiB7XG4gIGJ1aWxkZXJOYW1lOiBzdHJpbmc7XG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gIG9wdGlvblNjaGVtYToganNvbi5zY2hlbWEuSnNvblNjaGVtYTtcbn07XG5cblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIG9mIFwicHJvamVjdDp0YXJnZXRbOmNvbmZpZ3VyYXRpb25dXCIgZm9yIHRoZSB0YXJnZXQgb2JqZWN0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gdGFyZ2V0U3RyaW5nRnJvbVRhcmdldCh7cHJvamVjdCwgdGFyZ2V0LCBjb25maWd1cmF0aW9ufTogVGFyZ2V0KSB7XG4gIHJldHVybiBgJHtwcm9qZWN0fToke3RhcmdldH0ke2NvbmZpZ3VyYXRpb24gIT09IHVuZGVmaW5lZCA/ICc6JyArIGNvbmZpZ3VyYXRpb24gOiAnJ31gO1xufVxuIl19