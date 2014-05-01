<?php

/*
Plugin Name: TinyMCE Color Picker
Plugin URI: http://wordpress.org/plugins/tinymce-colorpicker/
Description: A color picker for the TinyMCE editor.
Author: Janneke Van Dorpe
Author URI: http://jannekevandorpe.com
Version: 1.3
Text Domain: tinymce-colorpicker
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
*/

add_action( 'mce_external_plugins', 'tinymce_cp__mce_external_plugins' );

function tinymce_cp__mce_external_plugins( $plugins ) {

	$plugins['wptextcolor'] = plugin_dir_url( __FILE__ ) . 'tinymce-colorpicker.js';

	return $plugins;

}

add_action( 'wp_enqueue_editor', 'tinymce_cp__wp_enqueue_editor' );

function tinymce_cp__wp_enqueue_editor( $args ) {

	if ( ! empty( $args['tinymce'] ) ) {

		wp_enqueue_style( 'tinymce-colorpicker', plugin_dir_url( __FILE__ ) . 'tinymce-colorpicker.css' );
		wp_enqueue_script( 'wp-color-picker' );

	}
}

add_filter( 'tiny_mce_before_init', 'tinymce_cp__tiny_mce_before_init' );

function tinymce_cp__tiny_mce_before_init( $init ) {

	$settings = array(
		'customColors' => get_option( 'tinymce_cp__colors', array() ),
		'nonce' => current_user_can( 'edit_others_posts' ) ? wp_create_nonce( 'tinymce_cp_save_colors' ) : false,
		'ajaxurl' => admin_url( 'admin-ajax.php', 'relative' )
	);

	$init['tinyMCEColorPicker'] = json_encode( $settings );

	return $init;

}

add_filter( 'mce_buttons_2', 'tinymce_cp__mce_buttons_2' );

function tinymce_cp__mce_buttons_2( $buttons ) {

	if ( ( $key = array_search( 'forecolor', $buttons ) ) !== false ) {
		array_splice( $buttons, $key + 1, 0, 'backcolor' );
	} else {
		array_push( $buttons, 'forecolor', 'backcolor' );
	}

	return $buttons;

}

add_action( 'wp_ajax_tinymce_cp__update_option', 'tinymce_cp__update_option' );

function tinymce_cp__update_option() {

	if ( current_user_can( 'edit_others_posts' ) &&
			wp_verify_nonce( $_POST['tinymce_cp_nonce'], 'tinymce_cp_save_colors' ) &&
			! empty( $_POST['tinymce_cp_colors'] ) &&
			is_array( $_POST['tinymce_cp_colors'] ) ) {

		$colors = array();

		foreach ( $_POST['tinymce_cp_colors'] as $color ) {
			if ( preg_match( '/^#[0-9a-f]{3,6}$/', $color ) ) {
				$colors[] = $color;
			}
		}

		update_option( 'tinymce_cp__colors', $colors );

	}

	die;

}
