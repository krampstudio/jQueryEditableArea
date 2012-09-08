/*
 * $('#target').pluginName(options); calls Plugin.init(options)
 * $('#target').pluginName('aMethod'); calls public method Plugin.aMethod();
 */
(function( $ ){
    "use strict";
    
    var Plugin = {
        _opts : {
			//contains default options
        },
		bubble : null,
        init: function(options){
            var opts = $.extend(true, {}, InfoBubble._opts, options);
            return this.each(function() {
                var $elt = $(this);
				//initialisation code
				});
        },
		aMethod : function(){
			this.each(function() {
                var $elt = $(this);
				//a plublic method
            });
		},
		_anotherMethod : function(){
			this.each(function() {
                var $elt = $(this);
                //a private method
            });
		},
        destroy : function(){
            this.each(function() {
            	var $elt = $(this);
				//destroy code	
			});
        }
    };

    $.fn.pluginName = function( method ) {        
        if ( Plugin[method] ) {
			if(/^_/.test(method)){
				$.error( 'Trying to call a private method ' +  method + ' on jQuery.pluginName' );
			} else {
				return Plugin[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        	}
		} else if ( typeof method === 'object' || ! method) {
        	return Plugin.init.apply( this, arguments );
        } else {
          	$.error( 'Method ' +  method + ' does not exist on jQuery.pluginName' );
        }
    };

})( jQuery );
