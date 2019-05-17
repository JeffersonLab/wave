/**
 * Created by galbi on 5/6/2016.
 * https://github.com/galbi101/jquery-whenall
 */
(function(factory) {
	if ( typeof define === "function" && define.amd ) {
		// AMD. Register as an anonymous module.
		define(["jquery"], factory);
	}
	else {
		// Browser globals
		factory(jQuery);
	}
}
(function($) {
	$.whenAll = function() {
		var masterDeferred = $.Deferred(),
			deferreds = [],
			progressDeferreds = [],
			allFulfilled = false,
			initialProgress = true,
			notifyMasterDeferred = function() {
				masterDeferred.notify.apply(
					masterDeferred,
					progressDeferreds.length > 1 ?
						$.makeArray(progressDeferreds).map(function(progressDeferred) {
							return progressDeferred.__latestArgs__.length > 1 ?
								$.makeArray(progressDeferred.__latestArgs__)
								: (progressDeferred.__latestArgs__.length == 1 ? progressDeferred.__latestArgs__[0] : void 0);
						})
						: arguments
				);
			},
			hasRejected = false;
		$.each(arguments, function(i, promise) {
			var deferred = $.Deferred();
			var progressDeferred = $.Deferred();
			if (promise && promise.then) {
				var afterFulfillment = function() {
					deferred.resolve.apply(deferred, arguments);
					if (initialProgress) {
						progressDeferred.__latestArgs__ = arguments;
						progressDeferred.resolve.apply(progressDeferred, arguments);
					}
				};
				promise.then(
					// done
					afterFulfillment,
					// fail
					function() {
						hasRejected = true;
						afterFulfillment.apply(this, arguments);
					},
					// progress
					function() {
						// if progress received while there are still promises who aren't fulfilled/progressed
						progressDeferred.__latestArgs__ = arguments;
						if (initialProgress) {
							progressDeferred.resolve.apply(progressDeferred, arguments);
						}
						// if all promises are either fulfilled or progressed
						else {
							notifyMasterDeferred.apply(null, arguments);
						}
					}
				);
			}
			else {
				deferred.resolve(promise);
				progressDeferred.__latestArgs__ = [promise];
				progressDeferred.resolve(promise);
			}
			deferreds.push(deferred);
			progressDeferreds.push(progressDeferred);
		});
		/*
		 when all the promises are in final state (resolved/rejected) - if even
		 one of the promises is rejected, the returned master promise is rejected iff one or more of the promises are rejected.
		 otherwise, it's resolved.
		 */
		$.when.apply($, deferreds).done(function() {
			allFulfilled = true;
			masterDeferred[hasRejected ? 'reject' : 'resolve'].apply(masterDeferred, arguments);
		});
		/*
		 when at least one of the promises has "progressed", while
		 all the others are resolved/rejected - the returned master promise
		 is notifying a "progress".
		 For each further "progress" notification coming from the unsettled promises, a further notification will be
		 called on the master promise.
		 */
		$.when.apply($, progressDeferreds).done(function() {
			if (!allFulfilled) {
				notifyMasterDeferred.apply(null, arguments);
				initialProgress = false;
			}
		});
		return masterDeferred.promise();
	};
}));