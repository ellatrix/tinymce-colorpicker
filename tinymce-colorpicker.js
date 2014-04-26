tinymce.PluginManager.add( 'wptextcolor', function( editor ) {

	'use strict';

	var $ = window.jQuery,
		colors = [
			'#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
			'#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
			'#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
			'#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd',
			'#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0',
			'#a61c00', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7', '#a64d79',
			'#85200c', '#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#1155cc', '#0b5394', '#351c75', '#741b47',
			'#5b0f00', '#660000', '#783f04', '#7f6000', '#274e13', '#0c343d', '#1c4587', '#073763', '#20124d', '#4c1130'
		],
		customColors = $.isArray( wpColorPicker.customColors ) ? wpColorPicker.customColors.slice( -20 ) : [];

	function colorPalette( color ) {
		var palette;
		color && customColors.push( color );
		palette = colors.concat( customColors );
		for ( var i = 0, placeholders = []; i < ( 20 - customColors.length ); i++ ) {
			placeholders.push( '#eee' );
		}
		palette = palette.concat( placeholders );
		return palette;
	}

	function setActiveColor( property ) {
		var color = editor.dom.toHex( editor.dom.getStyle( editor.selection.getNode(), property ) ),
			colors = $( '.tinymce-cp-body-' + property + ' .iris-palette' ).removeClass( 'active' );
		if ( color ) {
			colors.each( function() {
				$( this ).addClass( property + '-' + editor.dom.toHex( $( this ).css( 'background-color' ) ).slice( 1, 7 ) );
			} );
			colors.filter( '.' + property + '-' + color.slice( 1, 7 ) ).addClass( 'active' );
		}
	}

	function createButton( name, command, property, tooltip ) {

		editor.addButton( name, {
			type: 'colorbutton',
			tooltip: tooltip,
			selectcmd: command,
			panel: {
				role: 'application',
				ariaRemember: true,
				html: function() {
					return '<div class="tinymce-cp-body-' + property + '">' +
						'<input type="text" value="#8224e3" class="tinymce-cp-' + property + '-value" />' +
						'</div>' +
						'<div class="tinymce-cp-footer">' +
							'<button class="button tinymce-cp-custom-' + property + '-back" style="display: none;">Back</button>' +
							'<button class="button tinymce-cp-custom-' + property + '">Add custom color</button>' +
							'<div class="clear"></div>' +
						'</div>';
				},
				onPostRender: function() {
					var button = this.parent(),
						chosenColor = false,
						chosingColor = false;

					$( '.tinymce-cp-' + property + '-value' ).wpColorPicker( {
						hide: false,
						palettes: colorPalette(),
						change: function( event, ui ) {
							var color = ui.color.toString();
							if ( ! chosingColor ) {
								button.color( color );
								if ( editor.dom.toHex( editor.dom.getStyle( editor.selection.getNode(), property ) ) !== color ) {
									editor.execCommand( command, false, color );
								}
								button.hidePanel();
							} else {
								chosenColor = color;
								$( '.tinymce-cp-custom-' + property ).prop( 'disabled', false ).addClass( 'button-primary' );
							}
						},
						clear: function() {
							if ( editor.dom.toHex( editor.dom.getStyle( editor.selection.getNode(), property ) ) ) {
								button.color( button.color() );
								editor.execCommand( command, false, button.color() );
							}
							button.hidePanel();
						}
					} );

					$( '.tinymce-cp-custom-' + property + ', .tinymce-cp-custom-' + property + '-back' ).on( 'click', function( event ) {
						if ( chosingColor && chosenColor && $( event.target ).hasClass( 'tinymce-cp-custom-' + property ) ) {
							$.post( ajaxurl, {
								action: 'tinymce_cp__update_option',
								option: 'tinymce_cp__colors',
								value: customColors.concat( [ chosenColor ] )
							} );
							$( '.tinymce-cp-color-value, .tinymce-cp-background-color-value' ).iris( 'option', 'palettes', colorPalette( chosenColor ) );
							button.color( chosenColor );
							editor.execCommand( command, false, chosenColor );
							button.hidePanel();
						}
						chosenColor = false;
						chosingColor = ! chosingColor;
						$( '.tinymce-cp-body-' + property + ' .iris-palette-container, .tinymce-cp-body-' + property + ' .iris-picker-inner, .tinymce-cp-body-' + property + ' .wp-picker-input-wrap, .tinymce-cp-custom-' + property + '-back' ).toggle();
						$( '.tinymce-cp-custom-' + property ).prop( 'disabled', chosingColor ).removeClass( 'button-primary' );
					} );

					$( '.tinymce-cp-body-' + property + ' .iris-picker-inner' ).hide();
					$( '.tinymce-cp-body-' + property + ' .wp-picker-input-wrap' ).hide();

					setActiveColor( property );
				}
			},
			onclick: function() {
				this._color && editor.execCommand( command, false, this._color );
			},
			onPostRender: function() {
				var button = this;
				editor.on( 'click', function( event ) {
					var color = editor.dom.toHex( editor.dom.getStyle( event.target, property ) );
					color && button.color( color );
				} );

				$( '.mce-colorbutton .mce-open' ).on( 'click', function() {
					setActiveColor( property );
				} );
			}
		} );

	}

	createButton( 'forecolor', 'ForeColor', 'color', 'Text color' );
	createButton( 'backcolor', 'HiliteColor', 'background-color', 'Background color' );

} );
