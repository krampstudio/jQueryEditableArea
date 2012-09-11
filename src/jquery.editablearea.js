(function( $ ){
    "use strict";
    
    var EditableArea = {
        _opts : {
            save : {
                label : 'Save'
            },
            cancel : {
                label : 'Cancel'
            },
			cssClass 	: 'editable',
			hoverClass	: 'editablearea-hover',
			ctrlBoxClass: 'editablearea-control-box',
			exclusive	: false	//nyi
        },
		_editor : {
			script : '../lib/jwysiwyg/jquery.wysiwyg.js',
			stylesheet : '../lib/jwysiwyg/jquery.wysiwyg.css',
			createEditor : function($elt){
				$elt.wysiwyg();
			},
			_initialized : false
		},
        _editing : [],
        _isEditing: function(id){
            return ($.inArray(id, EditableArea._editing) > -1);
        },
		setupEditor : function(){
			if(this._editor && typeof this._editor == 'object'){
				var editor = this._editor;
				//old school dependencies loading
				if(editor.stylesheet){
					var stylesheet = $("<link rel='stylesheet' type='text/css' href='"+editor.stylesheet+"' />");
					$('head').append(stylesheet);
				}
				if(editor.script){
					$.getScript(editor.script, function onScriptLoaded(){
						editor._initialized = true;
					});
				} else {
					//if there is no script option defined, we guess it doesn't need one
					editor._initialized = true;
				}
			}
		},
        setupArea: function(options){
			var editor = EditableArea._editor;
			//initialize the editor only once
			if(editor && !editor._initialized){
				EditableArea.setupEditor();      
			}

            var opts = $.extend(true, {}, EditableArea._opts, options);
            return this.each(function() {
                var $elt = $(this);
                var id = $elt.attr('id');
                if(!id){
                    $.error('editable areas must be identified by a unique id');   
                }
				if(!$elt.hasClass(opts.cssClass)){
					$elt.addClass(opts.cssClass);
				}
                $elt.mouseover(function(){
                    if(!EditableArea._isEditing(id)){
                        $elt.css('cursor', 'pointer');
                        if(opts.hoverClass){
                            $elt.addClass(opts.hoverClass);
                        }
                    }
                })
                .mouseout(function(){
                    $elt.css('cursor', 'default');
                    if(opts.hoverClass){
                        $elt.removeClass(opts.hoverClass);
                    }
                })
                .click(function(){
                    
                    if(!EditableArea._isEditing(id)){
                        EditableArea._editing.push(id);
                        var type = ($elt.children().length === 0) ? 'text' : 'wysiwyg';
                        var $editable, baseValue;
                        if (type == 'text') {
                            $editable = $("<input type='text' />");
                            baseValue = $elt.text();
                            $editable.val(baseValue)
                                    .attr('id', id + '_edit')
                                    .width(parseInt($elt.width(), 10) + 'px');
                            $elt.empty().append($editable);
                        }
                        else{
                            $editable = $("<textarea />");
                            baseValue = $elt.html();
                            $editable.val(baseValue)
                                    .attr('id', id + '_edit')
                                    .width(parseInt($elt.width(), 10) + 'px');
                            $elt.empty().append($editable);
                			if(editor && typeof editor.createEditor === 'function'){
				            	EditableArea._editor.createEditor($editable);
							}
                        }
                        $elt.data('editableArea', {
                            type : type,
                            baseValue : baseValue
                        });
                        if(opts.fieldClass){
                            $elt.addClass(opts.fieldClass);
                        }
                        var saveCtrlId = id + '_edit_control_save',
                            cancelCtrlId = id + '_edit_control_cancel';
                        var $controlBox = $("<div class='"+opts.ctrlBoxClass+"'>" +
                                                "<a id='" + cancelCtrlId + "' href='#'>"+opts.cancel.label+"</a> " +
                                                "<a id='" + saveCtrlId + "' href='#'>"+opts.save.label+"</a>" +
                                            "</div>");
                        $elt.append($controlBox);
                        if($.ui){   //check if jquery-ui is loaded
                            $('a', $controlBox).button();
                        }
                        $('#' + saveCtrlId).click(function(){
                            var id = $(this).attr('id').replace('_edit_control_save', '');
                            var $elt = $('#' + id);
                            $elt.trigger('save.editableArea', $elt.editableArea('getValues'));
                            $elt.trigger('close.editableArea');
                        });
                         $('#' + cancelCtrlId).click(function(){
                            var id = $(this).attr('id').replace('_edit_control_cancel', '');
                            $('#' + id).editableArea('destroy');
                        });
                    }
                })
                .on('close.editableArea', function(){
                    $(this).editableArea('closeArea');
                });
            });
        },
        closeArea : function(value){
            return this.each(function() {
                var $elt = $(this);
                if(EditableArea._isEditing($elt.attr('id'))){
                    value = value || $elt.editableArea('getValue');
                    var data = $elt.data('editableArea');
                    $elt.empty();
                    switch(data.type){
                        case 'wysiwyg' : $elt.html(value); break;
                        case 'text' : $elt.text(value); break;
                    }
                   setTimeout(function(){   //isn't called if not in a settimeout; don't know why!
                        var index = EditableArea._editing.indexOf($elt.attr('id'));
                        EditableArea._editing.splice(index,1);
                   }, 1);
                }
            }); 
        },
        getValues : function(){
            var values = [];
            this.each(function() {
                var $elt = $(this);
                if(EditableArea._isEditing($elt.attr('id'))){
                    var $editable = $('#' +$elt.attr('id') + '_edit', $elt);
                    var data = $elt.data('editableArea');
                    switch(data.type){
                    case 'text': 
                        values.push($editable.val());
                        break;
                    case 'wysiwyg': 
                        values.push($editable.wysiwyg('getContent'));
                        break;
                    }
                }
            }); 
            
            return (values.length === 1) ? values[0] : values;
        },
        destroy : function(){
            this.each(function() {
                var $elt = $(this); console.log('destroy')
                if(EditableArea._isEditing($elt.attr('id'))){
                    var data = $elt.data('editableArea');
                    $elt.editableArea('closeArea', data.baseValue);
                }
                $elt.off('.editableArea');
            });
        }
    };

	$.editableArea = {};
	$.editableArea.setUpEditor : function(options){
		$.extend(EditableArea.editor, options);
	};
    $.fn.editableArea = function( method ) {        
        if ( EditableArea[method] ) {
            if(/^_/.test(method)){
                $.error( 'Trying to call a private method ' +  method + ' on jQuery.pluginName' );
			} else {
                return EditableArea[method].apply( this, Array.prototype.slice.call( arguments, 1 ));      
			}
        } else if ( typeof method === 'object' || ! method ) {
            return EditableArea.setupArea.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.editableArea' );
        }    
    };

})( jQuery );
