(function (angular) {

  'use strict';

  /**
   * @ngdoc directive
   * @name ngPerformanceApp.directive:ngPerformance
   * @description
   * # ngPerformance
   */

  var _el;

  function _setText(id, text) {
    if (_el[id]) {
      _el[id].textContent = text;
    }
  }

var ngPerformanceModule = angular.module('blndspt.ngPerformance', []);

  ngPerformanceModule.directive('ngPerformance', [
      '$log',
      '$window',
      '$document',
      '$rootScope',
      function ($log, $window, $document, $rootScope) {

        //Initialize performance stats variables
        var ngStart = (performance != null) ? performance.now() : 0;
        var stats = ($window.perfStats) ? $window.perfStats :
        {
          TTLB: 0,
          appLoad: 0,
          bodyLoad: 0,
          footerLoad: 0,
          headLoad: 0,
          headStart: 0,
          metricsLoad: 0,
          timeToAngular: 0,
          vendorScriptLoad: 0
        };

        stats.timeToAngular = (ngStart - stats.headStart);

        //Count Scopes and Watchers
        var _countScopesWatchers = function () {
          // This logic is borrowed from $digest(). Keep it in sync!
          var next, current, target = $rootScope;
          var scopes = 0,
            watchers = 0;

          current = target;
          do {
            scopes += 1;

            if (current.$$watchers) {
              watchers += current.$$watchers.length;
            }

            // Insanity Warning: scope depth-first traversal
            // yes, this code is a bit crazy, but it works and we have tests to prove it!
            // this piece should be kept in sync with the traversal in $broadcast
            if (!(next = (current.$$childHead || (current !== target && current.$$nextSibling)))) {
              while (current !== target && !(next = current.$$nextSibling)) {
                current = current.$parent;
              }
            }
          } while ((current = next));

          return [scopes, watchers];
        };

        return {
          templateUrl: '/app/blocks/performance/ngPerformance.html',
          restrict: 'EA',
          link: function (/*scope, element, attrs*/) {

            // Cache DOM elements
            _el = {
              '#scopes': $document[0].querySelector('#scopes'),
              '#watchers': $document[0].querySelector('#watchers'),
              '#dirty-checks': $document[0].querySelector('#dirty-checks'),
              '#digest-cycles': $document[0].querySelector('#digest-cycles'),
              '#digest-ms': $document[0].querySelector('#digest-ms'),
              '#digest-fps': $document[0].querySelector('#digest-fps'),
              '#avg-digest-ms': $document[0].querySelector('#avg-digest-ms'),
              '#avg-digest-fps': $document[0].querySelector('#avg-digest-fps'),
              '#max-digest-ms': $document[0].querySelector('#max-digest-ms'),
              '#max-digest-fps': $document[0].querySelector('#max-digest-fps'),

              '#head-load': $document[0].querySelector('#head-load'),
              '#body-load': $document[0].querySelector('#body-load'),
              '#footer-load': $document[0].querySelector('#footer-load'),
              '#vendor-load': $document[0].querySelector('#vendor-load'),
              '#app-load': $document[0].querySelector('#app-load'),
              '#metrics-load': $document[0].querySelector('#metrics-load'),
              '#time-to-eop': $document[0].querySelector('#time-to-eop'),
              '#time-to-ng': $document[0].querySelector('#time-to-ng'),
            };

            if (stats.headLoad !== undefined) { _setText('#head-load', stats.headLoad.toFixed(1)) };
            if (stats.bodyLoad !== undefined) { _setText('#body-load', stats.bodyLoad.toFixed(1)) };
            if (stats.footerLoad !== undefined) { _setText('#footer-load', stats.footerLoad.toFixed(1)) }
            if (stats.vendorScriptLoad !== undefined) { _setText('#vendor-load', stats.vendorScriptLoad.toFixed(1)) };
            if (stats.appLoad !== undefined) { _setText('#app-load', stats.appLoad.toFixed(1)) };
            if (stats.metricsLoad !== undefined) { _setText('#metrics-load', stats.metricsLoad.toFixed(1)) };
            if (stats.TTLB !== undefined) { _setText('#time-to-eop', stats.TTLB.toFixed(1)) };
            if (stats.timeToAngular !== undefined) { _setText('#time-to-ng', stats.timeToAngular.toFixed(1)) };


            // If the browser doesn't support Web Performance API
            // (I'm looking at you, Safari), don't even try.
            if (performance != null) {
              var digestCycles = 0,
                digestStart = 0,
                sumDigestMs = 0,
                maxDigestMs = 0,
                dirtyChecks = 0;

              // $digest loop uses a reverse while.
              // Pushing onto the end of $$watchers array makes this run first...
              $rootScope.$$watchers.push({
                eq: false,
                last: null,
                fn: function () {
                },
                exp: function () {
                },
                get: function () {
                  dirtyChecks++;

                  // Only update digestStart if not set. This allows for multiple
                  // iterations inside the "dirty loop."
                  //
                  // NOTE: This technique for timing the $digest cycles
                  //       DOES NOT capture time spent processing the asyncQueue!
                  if (digestStart === 0) {
                    // $log.debug('$rootScope.$watch: digestStart');
                    digestStart = performance.now();
                    digestCycles++;
                  }

                  // Schedules a one-shot callback after digest loop is clean
                  $rootScope.$$postDigest(function () {
                    if (digestStart !== 0) {
                      var digestEnd = performance.now();
                      var digestMs = (digestEnd - digestStart);
                      _setText('#digest-ms', digestMs.toFixed(1));
                      _setText('#digest-fps', (1000 / digestMs).toFixed(0));

                      maxDigestMs = Math.max(digestMs, maxDigestMs);
                      _setText('#max-digest-ms', maxDigestMs.toFixed(1));
                      _setText('#max-digest-fps', (1000 / maxDigestMs).toFixed(0));

                      sumDigestMs += digestMs;
                      if (digestCycles > 0) {
                        var avgDigestMs = sumDigestMs / digestCycles;
                        _setText('#avg-digest-ms', avgDigestMs.toFixed(1));
                        _setText('#avg-digest-fps', (1000 / avgDigestMs).toFixed(0));
                      }

                      _setText('#dirty-checks', dirtyChecks);
                      _setText('#digest-cycles', digestCycles);

                      var count = _countScopesWatchers();
                      var scopes = count[0],
                        watchers = count[1];

                      _setText('#scopes', scopes);
                      _setText('#watchers', watchers);

                      var log = 'NG-PERF: Digest Cycle #' + digestCycles + ': ' + digestMs.toFixed(1) + ' ms, ' +
                        'Scopes: ' + scopes + ', Watchers: ' + watchers +
                        ' [Overhead: ' + (performance.now() - digestEnd).toPrecision(3) + ' ms]';
                      $log.debug(log);
                      if ($window.console.timeStamp) {
                        $window.console.timeStamp(log);
                      }

                      // Register an async function to run first.
                      //
                      // NOTE: This technique for timing the $digest cycles
                      //       DOES capture time spent processing the asyncQueue!
                      // $rootScope.$$asyncQueue.unshift({
                      // 	scope: $rootScope,
                      // 	expression: function (scope) {
                      // 		// $log.debug('$rootScope.$evalAsync: digestStart');
                      // 		digestStart = performance.now();
                      // 		digestCycles++;
                      // 	}
                      // });

                      // Clear digestStart for next "dirty loop."
                      digestStart = 0;
                    }
                  });

                  return null;
                }
              });
            }

          }

        };
      }]);

})

(angular);
