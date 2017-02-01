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
  var Event = analytics.Event;

  var restoreTimestamps = function(){
    var lastReportedPromise = Flybits.store.Property.get(Flybits.cfg.store.ANALYTICSLASTREPORTED).then(function(epoch){
      if(epoch){
        analyticsManager.lastReported = +epoch;
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
    _analyticsStore: null,
    _uploadChannel: null,
    _timedEventCache: {},
    /**
     * @memberof Flybits.analytics.Manager
     * @member {boolean} isReporting Flag indicating whether scheduled analytics reporting is enabled.
     */
    isReporting: false,
    /**
     * Restores Manager state properties, initializes default local storage and upload channel, and starts automated batch reporting of stored analytics.
     * @memberof Flybits.analytics.Manager
     * @function initialize
     * @return {external:Promise<undefined,Flybits.Validation>} Promise that resolves without a return value and rejects with a common Flybits Validation model instance.
     */
    initialize: function(){
      var def = new Deferred();
      var manager = this;

      this._analyticsStore = new analytics.BrowserStore({
        maxStoreSize: Flybits.cfg.analytics.MAXSTORESIZE
      });
      this._uploadChannel = new analytics.DefaultChannel();
      
      restoreTimestamps().then(function(){
        return manager.startReporting();
      }).then(function(){
        def.resolve();
      }).catch(function(e){
        def.reject(e);
      });

      return def.promise;
    },
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
      
      Session.resolveSession().then(function(user){
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
      var manager = this;
      var eventTmpIDs;
      this._analyticsStore.getAllEvents().then(function(events){
        eventTmpIDs = events.map(function(evt){
          return evt.tmpID;
        });
        if(eventTmpIDs.length < 1){
          throw new Validation().addError('No analytics to upload.','',{
            code: Validation.type.NOTFOUND
          });
        }
        return manager._uploadChannel.uploadEvents(events);
      }).then(function(){
        manager.lastReported = Date.now();
        Flybits.store.Property.set(Flybits.cfg.store.ANALYTICSLASTREPORTED,manager.lastReported);
        return manager._analyticsStore.clearEvents(eventTmpIDs);
      }).then(function(){
        def.resolve();
      }).catch(function(e){
        if(e instanceof Validation && e.firstError().code !== Validation.type.NOTFOUND){
          console.error('> analytics report error',e);
        }
        def.reject(e);
      }).then(function(){
        manager.lastReportAttempted = Date.now();
        Flybits.store.Property.set(Flybits.cfg.store.ANALYTICSLASTREPORTATTEMPTED,manager.lastReportAttempted);
      });
      
      return def.promise;
    },
    /**
     * Log a discrete analytics event.
     * @memberof Flybits.analytics.Manager
     * @function logEvent
     * @param {string} eventName Name of event.
     * @param {Object} properties Map of custom properties.
     * @return {external:Promise<undefined,Flybits.Validation>} Promise that resolves without a return value and rejects with a common Flybits Validation model instance.
     */
    logEvent: function(eventName, properties){
      var evt = new Event({
        name: eventName,
        type: Event.types.DISCRETE
      });
      evt.properties = properties;

      return this._analyticsStore.addEvent(evt);
    },
    /**
     * Log the start of timed analytics event.
     * @memberof Flybits.analytics.Manager
     * @function startTimedEvent
     * @param {string} eventName Name of event.
     * @param {Object} properties Map of custom properties.
     * @return {external:Promise<undefined,Flybits.Validation>} Promise that resolves with a reference ID of the timed start event for use when ending the timed event. The promise will reject with a common Flybits Validation model instance should any error occur.
     */
    startTimedEvent: function(eventName, properties){
      var manager = this;
      var def = new Deferred();
      var evt = new Event({
        name: eventName,
        type: Event.types.TIMEDSTART
      });
      evt.properties = properties || {};
      evt.setProperty('_timedRef',evt.tmpID);

      this._analyticsStore.addEvent(evt).then(function(){
        manager._timedEventCache[evt.tmpID] = evt;
        def.resolve(evt.tmpID);
      }).catch(function(e){
        def.reject(e);
      });

      return def.promise;
    },
    /**
     * Log the end of timed analytics event.
     * @memberof Flybits.analytics.Manager
     * @function endTimedEvent
     * @param {string} refID Reference ID of timed start event.
     * @return {external:Promise<undefined,Flybits.Validation>} Promise that resolves without a return value and rejects with a common Flybits Validation model instance.
     */
    endTimedEvent: function(refID){
      var manager = this;
      var def = new Deferred();
      var startedEvt = manager._timedEventCache[refID];
      if(!refID || !startedEvt){
        def.reject(new Validation().addError('No Timed Event Found','No corresponding start event was found for provided reference.',{
          code: Validation.type.NOTFOUND,
          context: refID
        }));
        return def.promise;
      }

      var endEvt = new Event({
        name: startedEvt.name,
        type: Event.types.TIMEDEND,
        properties: startedEvt.properties
      });
      this._analyticsStore.addEvent(endEvt).then(function(){
        delete manager._timedEventCache[refID];
        def.resolve();
      }).catch(function(e){
        def.reject(e);
      });

      return def.promise;
    }
  };

  return analyticsManager;

})();