/**
 * jQuery editable area plugin
 * Copyright (C) 2012  Bertrand CHEVRIER, KrampStudio
 * 
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/> 
 * 
 * @author <a href="mailto:chevrier.bertrand@gmail.com">Bertrand Chevrier</a>
 * @license http://www.gnu.org/licenses/gpl-3.0.txt
 * @version $version$
 * @requires jquery >= 1.7
 */
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
			cssClass	: 'editable',
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
				if(editor.stylesheet){
					EditableArea._loadScript(editor.stylesheet, function(err){
						if(err){
							$.error(err);	
						}
					});
				}
				if(editor.script){
					EditableArea._loadScript(editor.script, function(err){
                        if(err){
                            $.error(err);
                        } else {
							editor._initialized = true;
						}
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
                    value = value || $elt.editableArea('getValues');
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
                var $elt = $(this);
                if(EditableArea._isEditing($elt.attr('id'))){
                    var data = $elt.data('editableArea');
                    $elt.editableArea('closeArea', data.baseValue);
                }
                $elt.off('.editableArea');
            });
        }
    };
	

	/**
	 * Load a script dynamically
	 * @param {String} the script path
	 * @param {Function} callback(err)
	 */
	EditableArea._loadScript = function(script, callback){
		if(location.protocol === 'file:'){
			$.warn('Dynamic script loading is only supported on HTTP');
		} else {
			if(/\.css$/.test(script)){
				$('head').append(
					"<link rel='stylesheet' type='text/css' href='"+script+"' />"
				);
			}
			if(/\.js$/.test(script)){
				$.getScript(script)
					.done(function getScriptDone(script, textStatus){
						callback(null);
					})
					.fail(function getScriptFail(req, settings, exception){
						callback(exception);
					});
			}
		}
	};

	$.editableArea = {};
	/**
	 * Set up a different rich editor
	 * @param {Object} options
	 * @param {String} [options.script="../lib/jwysiwyg/jquery.wysiwyg.js"] the path to the rich editor script
     * @param {String} [options.stylesheet="../lib/jwysiwyg/jquery.wysiwyg.css"] the path to the rich editor css
     * @param [Function] [options.createEditor=function($elt){$elt.wysiwyg();}] the callback used to initialize the editor from the element ($elt). 
	 */
	$.editableArea.setUpEditor = function(options){
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
