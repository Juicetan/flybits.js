/**
 * This is a utility class, do not use constructor.
 * @class Manager
 * @classdesc Main manager to collect and report events for later analysis.
 * @memberof Flybits.analytics
 */
analytics.Manager = (function(){
  var Deferred = Flybits.Deferred;
  var Validation = Flybits.Validation;
  var Session = Flybits.store.Session;

  var restoreTimestamps = function(){
    var lastReportedPromise = Flybits.store.Property.get(Flybits.cfg.store.ANALYTICSLASTREPORTED).then(function(epoch){
      if(epoch){
        mananalyticsManagerager.lastReported = +epoch;
      }
    });
    var lastReportAttemptedPromise = Flybits.store.Property.get(Flybits.cfg.store.ANALYTICSLASTREPORTATTEMPTED).then(function(epoch){
      if(epoch){
        analyticsManager.lastReportAttempted = +epoch;
      }
    });

    return Promise.settle([lastReportedPromise,lastReportAttemptedPromise]);
  };

  var analyticsManager = {
    /**
     * @memberof Flybits.analytics.Manager
     * @member {number} maxStoreSize=100 Maximum number of analytics events that can be stored locally before reporting to the server.  If any new events are created and the maximum has already been hit, the oldest records will be discarded first much like a queue.
     */
    maxStoreSize: 100,
    /**
     * @memberof Flybits.analytics.Manager
     * @member {number} reportDelay=3600000 Delay before the next interval of analytics reporting begins.  Note that the timer starts after the previous interval's analytics reporting has completed.  The delay unit type is defined in {@link Flybits.analytics.Manager.reportDelayUnit}
     */
    reportDelay: 3600000,
    /**
     * @memberof Flybits.analytics.Manager
     * @member {string} reportDelayUnit=milliseconds Unit of measure to be used for {@link Flybits.analytics.Manager.reportDelay}.  Possible values include: `milliseconds`, `seconds`, `hours`, `days`.
     */
    reportDelayUnit: 'milliseconds',
    /**
     * @memberof Flybits.analytics.Manager
     * @member {number} lastReported Epoch time (milliseconds) of when the manager last successfully reported analytics data.
     */
    lastReported: null,
    /**
     * @memberof Flybits.analytics.Manager
     * @member {number} lastReportAttempted Epoch time (milliseconds) of when the manager last attempted to report analytics data.  It is possible that this time does not coincide with {@link Flybits.analytics.Manager.lastReported} as the report may have failed or there was no analytics to report.
     */
    lastReportAttempted: null,
    _reportTimeout: null,
    /**
     * @memberof Flybits.analytics.Manager
     * @member {boolean} isReporting Flag indicating whether scheduled analytics reporting is enabled.
     */
    isReporting: false,
    /**
     * Stops the scheduled service that continuously batch reports collected analytics data if there exists any.
     * @memberof Flybits.analytics.Manager
     * @function stopReporting
     * @return {Flybits.analytics.Manager} Reference to this context manager to allow for method chaining.
     */
    stopReporting: function(){
      this.isReporting = false;
      clearTimeout(this._reportTimeout);
      return this;
    },
    /**
     * Starts the scheduled service that continuously batch reports collected analytics data if there exists any.
     * @memberof Flybits.analytics.Manager
     * @function startReporting
     * @return {external:Promise<undefined,Flybits.Validation>} Promise that resolves without a return value and rejects with a common Flybits Validation model instance.
     */
    startReporting: function(){
      var def = new Deferred();
      var manager = this;
      manager.stopReporting();
      
      restoreTimestamps().then(function(){
        return Session.resolveSession();
      }).then(function(user){
        var interval;
        interval = function(){
          manager.report().catch(function(e){}).then(function(){
            if(manager.isReporting){
              manager._reportTimeout = setTimeout(function(){
                interval();
              },manager.reportDelay);
            }
          });

          manager.isReporting = true;
        };
        interval();
        def.resolve();
      }).catch(function(e){
        def.reject(e);
      });

      return def.promise;
    },
    /**
     * Batch reports collected analytics data if it exists.
     * @memberof Flybits.analytics.Manager
     * @function report
     * @return {external:Promise<undefined,Flybits.Validation>} Promise that resolves without a return value and rejects with a common Flybits Validation model instance.
     */
    report: function(){
      var def = new Deferred();
      def.resolve();
      return def.promise;
    }
  };

  return analyticsManager;

})();