<?php

/*
Plugin Name: TinyMCE Colorpicker
Plugin URI: http://wordpress.org/plugins/tinymce-colorpicker/
Description: A colorpicker for the TinyMCE editor.
Author: avryl
Author URI: http://profiles.wordpress.org/avryl/
Version: 1.0
Text Domain: tinymce-colorpicker
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
*/

add_action( 'mce_external_plugins', 'tinymce_cp__mce_external_plugins' );

function tinymce_cp__mce_external_plugins( $plugins ) {

	$plugins['wptextcolor'] = plugin_dir_url( __FILE__ ) . 'tinymce-colorpicker.js';

	return $plugins;

}

add_action( 'tiny_mce_plugins', 'tinymce_cp__tiny_mce_plugins' );

function tinymce_cp__tiny_mce_plugins( $plugins ) {

	unset( $plugins['textcolor'] );

	return $plugins;

}

add_action( 'wp_enqueue_editor', 'tinymce_cp__wp_enqueue_editor' );

function tinymce_cp__wp_enqueue_editor( $args ) {

	if ( ! empty( $args['tinymce'] ) ) {

		wp_enqueue_style( 'wp-color-picker' );
		wp_enqueue_style( 'tinymce-colorpicker', plugin_dir_url( __FILE__ ) . '/tinymce-colorpicker.css' );
		wp_enqueue_script( 'wp-color-picker' );
		wp_localize_script( 'wp-color-picker', 'wpColorPicker', array( 'customColors' => get_option( 'tinymce_cp__colors' ) ) );

	}

}

add_filter('mce_buttons_2', 'tinymce_cp__mce_buttons_2');

function tinymce_cp__mce_buttons_2( $buttons ) {

	$buttons[] = 'backcolor';

	return $buttons;

}

add_action( 'wp_ajax_tinymce_cp__update_option', 'tinymce_cp__update_option' );

function tinymce_cp__update_option() {

	update_option( $_POST['option'], $_POST['value'] );

	die;

}
