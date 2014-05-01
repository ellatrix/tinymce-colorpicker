tinymce.PluginManager.add( 'wptextcolor', function( editor ) {

	'use strict';

	var $ = window.jQuery,
		settings = tinymce.settings.tinyMCEColorPicker || {},
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
		customColors = settings.customColors || [];

	if ( ! $ ) {
		return;
	}

	function colorPalette() {
		var palette = colors.concat( customColors ),
			i = 20 - customColors.length;

		while ( i > 0 && i-- ) {
			palette.push( '' );
		}

		return palette;
	}

	function setActiveColor( property, color, recalc ) {
		var colors = $( '.tinymce-cp-body-' + property + ' .iris-palette' ).removeClass( 'active' );
		color = color || editor.dom.toHex( editor.dom.getStyle( editor.selection.getNode(), property ) );

		if ( recalc ) {
			colors.each( function() {
				var hex = editor.dom.toHex( $( this ).css( 'background-color' ) );
				$( this ).addClass( property + '-' + hex.slice( 1, 7 ) ).data( 'color', hex );
			} );
		}

		if ( color ) {
			colors.filter( '.' + property + '-' + color.slice( 1, 7 ) ).first().addClass( 'active' );
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
					return '' +
						'<div class="tinymce-cp-body-' + property + '">' +
							'<input type="text" value="#8224e3" class="tinymce-cp-value">' +
						'</div>' +
						'<div class="tinymce-cp-footer">' +
							( settings.nonce ? '<button class="button tinymce-cp-custom">Add a color</button>' : '' ) +
							'<button class="button button-primary tinymce-cp-apply">Apply</button>' +
							'<div class="clear"></div>' +
						'</div>';
				},
				onPostRender: function() {
					var paletteContainer, picker,
						button = this.parent(),
						chosenColor = false,
						chosingColor = false,
						panel = $( this.getEl() ),
						applyButton = panel.find( '.tinymce-cp-apply' ).prop( 'disabled', true ),
						customButton = panel.find( '.tinymce-cp-custom' );

					function togglePanel() {
						chosenColor = false;
						chosingColor = ! chosingColor;

						if ( ! paletteContainer || ! picker ) {
							paletteContainer = panel.find( '.iris-palette-container' );
							picker = panel.find( '.iris-picker-inner, .wp-picker-input-wrap' );
						}

						paletteContainer.add( picker ).toggle();
						customButton.text( chosingColor ? 'Back' : 'Add a color' );
						applyButton.prop( 'disabled', true );
					}

					panel.find( '.tinymce-cp-value' ).wpColorPicker( {
						hide: false,
						palettes: colorPalette(),
						change: function( event, ui ) {
							var color = ui.color.toString();

							if ( ! chosingColor ) {
								setActiveColor( property, color, false );
							} else {
								chosenColor = color;
							}

							applyButton.prop( 'disabled', false );
						},
						clear: function() {
							chosenColor = '';
						}
					} );

					customButton.on( 'click', function() {
						togglePanel();
					} );

					applyButton.on( 'click', function( event ) {
						var color, customPalette, index, save, palette,
							ajaxurl = window.ajaxurl || settings.ajaxurl;

						if ( ! paletteContainer ) {
							paletteContainer = panel.find( '.iris-palette-container' );
						}

						palette = paletteContainer.find( 'a' );

						if ( chosingColor && chosenColor ) {
							color = chosenColor;

							customPalette = palette.slice( 79 );

							$.each( customPalette, function( i, element ) {
								if ( $( element ).hasClass( 'active' ) ) {
									index = i;
									return false;
								}
							} );

							if ( index ) {
								customColors.splice( index - 1, 1, chosenColor );
								save = true;
							} else if ( customColors.length < 20 ) {
								customColors.push( chosenColor );
								save = true;
							}

							if ( save && ajaxurl && settings.nonce ) {
								$.post( ajaxurl, {
									action: 'tinymce_cp__update_option',
									tinymce_cp_nonce: settings.nonce,
									tinymce_cp_colors: customColors
								} );
							}

							$( '.tinymce-cp-value' ).iris( 'option', 'palettes', colorPalette() );

							togglePanel();
						} else {
							$.each( palette, function( i, element ) {
								if ( $( element ).hasClass( 'active' ) ) {
									color = $( element ).data( 'color' );
									return false;
								}
							} );
						}

						if ( editor.dom.toHex( editor.dom.getStyle( editor.selection.getNode(), property ) ) !== color ) {
							editor.execCommand( command, false, color );
						}

						button.color( color );
						button.hidePanel();
					} );

					setActiveColor( property, false, true );
				}
			},
			onclick: function() {
				this._color && editor.execCommand( command, false, this._color );
			},
			onPostRender: function() {
				var button = this;

				editor.on( 'click keyup', function() {
					var color = editor.dom.toHex( editor.dom.getStyle( editor.selection.getNode(), property ) );
					color && button.color( color );
				} );

				$( '.mce-colorbutton .mce-open' ).on( 'click', function() {
					setActiveColor( property, false, true );
				} );
			}
		} );

	}

	createButton( 'forecolor', 'ForeColor', 'color', 'Text color' );
	createButton( 'backcolor', 'HiliteColor', 'background-color', 'Background color' );
} );
