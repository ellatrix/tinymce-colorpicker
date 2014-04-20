tinymce.PluginManager.add( 'wptextcolor', function( editor ) {

	function renderColorPicker() {
		return '<input type="text" value="#8224e3" class="tinymce-color-value" />';
	}

	function renderBackgroundColorPicker() {
		return '<input type="text" value="#8224e3" class="tinymce-backgroundcolor-value" />';
	}

	function onButtonClick() {
		var self = this;

		if (self._color) {
			editor.execCommand(self.settings.selectcmd, false, self._color);
		}
	}

	function onColorPostRender() {
		var ctrl = this.parent();

		jQuery( '.tinymce-color-value' ).wpColorPicker( {
			hide: false,
			change: function( event, ui ) {
				var color = ui.color.toString();
				ctrl.color( color );
				if ( editor.dom.toHex( editor.dom.getStyle( editor.selection.getNode(), 'color' ) ) !== color ) {
					editor.execCommand( ctrl.settings.selectcmd, false, color );
				}
			},
			clear: function() {
				ctrl.color( ctrl.color() );
				editor.execCommand( ctrl.settings.selectcmd, false, ctrl.color() );
				ctrl.hidePanel();
			}
		} );
	}

	function onBackgroundColorPostRender() {
		var ctrl = this.parent();

		jQuery( '.tinymce-backgroundcolor-value' ).wpColorPicker( {
			hide: false,
			change: function( event, ui ) {
				var color = ui.color.toString();
				ctrl.color( color );
				if ( editor.dom.toHex( editor.dom.getStyle( editor.selection.getNode(), 'background-color' ) ) !== color ) {
					editor.execCommand( ctrl.settings.selectcmd, false, color );
				}
			},
			clear: function() {
				ctrl.color( ctrl.color() );
				editor.execCommand( ctrl.settings.selectcmd, false, ctrl.color() );
				ctrl.hidePanel();
			}
		} );
	}

	editor.addButton( 'forecolor', {
		type: 'colorbutton',
		tooltip: 'Text color',
		selectcmd: 'ForeColor',
		panel: {
			role: 'application',
			ariaRemember: true,
			html: renderColorPicker,
			onPostRender: onColorPostRender
		},
		onclick: onButtonClick,
		onPostRender: function() {
			var ctrl = this;
			editor.on( 'click', function( event ) {
				var color = editor.dom.toHex( editor.dom.getStyle( event.target, 'color' ) ),
					keyup = jQuery.Event( 'keyup' );

				keyup.keyCode = keyup.which = 13;

				if ( color ) {
					ctrl.color( color );
					jQuery( '.tinymce-color-value' ).val( color ).trigger( keyup );
				}
			} );
		}
	} );

	editor.addButton( 'backcolor', {
		type: 'colorbutton',
		tooltip: 'Background color',
		selectcmd: 'HiliteColor',
		panel: {
			role: 'application',
			ariaRemember: true,
			html: renderBackgroundColorPicker,
			onPostRender: onBackgroundColorPostRender
		},
		onclick: onButtonClick,
		onPostRender: function() {
			var ctrl = this;
			editor.on( 'click', function( event ) {
				var color = editor.dom.toHex( editor.dom.getStyle( event.target, 'background-color' ) ),
					keyup = jQuery.Event( 'keyup' );

				keyup.keyCode = keyup.which = 13;

				if ( color ) {
					ctrl.color( color );
					jQuery( '.tinymce-backgroundcolor-value' ).val( color ).trigger( keyup );
				}
			} );
		}
	} );

} );
