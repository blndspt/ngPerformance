ngPerformance
========

Angular performance tracking for scopes, watchers, and other page load statistics

## Basic Usage
* download, clone or fork it
* (TO BE COMPLETED, not yet available) Or install it using [bower](http://twitter.github.com/bower/) `bower install angular-ngPerformance`
* Include the `ngPerformance.js` script provided by this component into your app.
* Copy the `ngPerformance.html` template provided by this component into desired views folder.
* Add `'blndspt.ngPerformance'` as a module dependency to your app: `angular.module('app', ['blndspt.ngPerformance'])`

**Template URL** (TO BE COMPLETED, not yet available)
```html
<div ng-performance templateUrl="views/ngPerformance.html" on></div>
```

## Demo
TBD

## Overview
While two-way binding in Angular is a blessing, it can also quickly become a kiss of death if not used with a meausre of care and caution.  With the simple ease of 'ng-binding' expressions and variables, folks often don't ask the important question of 'if they should have'.  Too often today you see pages where no caution was used within ng-repeats and the scopes and watchers exploded exponentially on the page.  Further, with very fast development environments, the overall impact may not be as evident at the time.  In combination with Angular's single binding features included in Angular > 1.3, or Pasquale Vazzana's bindonce module, responsible developers can ensure that only necessary items are two-way bound. 

This tool is simply a helper to 'give you the bad news' about how you are doing on any given page.  In the current release, the following Angular metrics reported:
* Total Scopes
* Total Watchers
* Dirty Checks
* Digest Cycles
* Average Digest Cycle
* Maximum Digest Cycle

Aside from Angular metrics, the tool also, using the Performance API, allows for tracking of:
* Head Load
* Body Load
* Footer Load
* Vendor Script Load
* App Load
* Metrics Load
* Time To End-of-Page
* Time To Angular

## Attribute Usage  (TO BE COMPLETED, not yet available)
| Attribute  | 	Description | 	Example  |
|------------|----------------|-----|
| `templateUrl`| Specifies the location to the HTML template (required)  | `<div ng-performance templateUrl="views/ngPerformance.html"><div>` |
| `on/off/param`| Specifies whether to display the panel always (on), never (off), or via Url parameter  | `<div ng-performance templateUrl="views/ngPerformance.html" param="performance"><div>` |

## Advanced Usage
In order to use the non-angular page load metrics, the Performance API is required in your entry point.  As such, this directive is really indended for SPA's or applications with some base layout file that is included on every page.  In short, collection of several attribute value 'times' are required throughout your entry point (usually index.html).  Needed variables are set by using simple Performance.Now offsets and then passed through to the directive via the $window object.  See the Page Load Demo for examples of how to use the Page Load metrics.  
