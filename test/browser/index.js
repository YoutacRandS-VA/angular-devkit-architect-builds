"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Observable_1 = require("rxjs/Observable");
const successBuildEvent = {
    success: true,
};
const failBuildEvent = {
    success: false,
};
class BrowserTarget {
    // constructor(public context: BuilderContext) { }
    run(_info) {
        return new Observable_1.Observable(obs => {
            obs.next(successBuildEvent);
            obs.next(failBuildEvent);
            obs.next(successBuildEvent);
            obs.complete();
        });
    }
}
exports.default = BrowserTarget;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2FuZ3VsYXJfZGV2a2l0L2FyY2hpdGVjdC90ZXN0L2Jyb3dzZXIvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7QUFFSCxnREFBNkM7QUFJN0MsTUFBTSxpQkFBaUIsR0FBZTtJQUNwQyxPQUFPLEVBQUUsSUFBSTtDQUNkLENBQUM7QUFFRixNQUFNLGNBQWMsR0FBZTtJQUNqQyxPQUFPLEVBQUUsS0FBSztDQUNmLENBQUM7QUFPRjtJQUNFLGtEQUFrRDtJQUVsRCxHQUFHLENBQUMsS0FBNEM7UUFDOUMsTUFBTSxDQUFDLElBQUksdUJBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUMxQixHQUFHLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDNUIsR0FBRyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUN6QixHQUFHLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDNUIsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2pCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBWEQsZ0NBV0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICdyeGpzL09ic2VydmFibGUnO1xuaW1wb3J0IHsgQnVpbGRFdmVudCwgQnVpbGRlciwgVGFyZ2V0IH0gZnJvbSAnLi4vLi4vc3JjJztcblxuXG5jb25zdCBzdWNjZXNzQnVpbGRFdmVudDogQnVpbGRFdmVudCA9IHtcbiAgc3VjY2VzczogdHJ1ZSxcbn07XG5cbmNvbnN0IGZhaWxCdWlsZEV2ZW50OiBCdWlsZEV2ZW50ID0ge1xuICBzdWNjZXNzOiBmYWxzZSxcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgQnJvd3NlclRhcmdldE9wdGlvbnMge1xuICBicm93c2VyT3B0aW9uOiBudW1iZXI7XG4gIG9wdGltaXphdGlvbkxldmVsOiBudW1iZXI7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJyb3dzZXJUYXJnZXQgaW1wbGVtZW50cyBCdWlsZGVyPEJyb3dzZXJUYXJnZXRPcHRpb25zPiB7XG4gIC8vIGNvbnN0cnVjdG9yKHB1YmxpYyBjb250ZXh0OiBCdWlsZGVyQ29udGV4dCkgeyB9XG5cbiAgcnVuKF9pbmZvOiBUYXJnZXQ8UGFydGlhbDxCcm93c2VyVGFyZ2V0T3B0aW9ucz4+KTogT2JzZXJ2YWJsZTxCdWlsZEV2ZW50PiB7XG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKG9icyA9PiB7XG4gICAgICBvYnMubmV4dChzdWNjZXNzQnVpbGRFdmVudCk7XG4gICAgICBvYnMubmV4dChmYWlsQnVpbGRFdmVudCk7XG4gICAgICBvYnMubmV4dChzdWNjZXNzQnVpbGRFdmVudCk7XG4gICAgICBvYnMuY29tcGxldGUoKTtcbiAgICB9KTtcbiAgfVxufVxuIl19