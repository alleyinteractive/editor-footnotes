<?php
namespace Editor_Footnotes;

/**
 * Homepage controller
 */
class Editor {
	use Singleton;

	public function setup() {
		add_filter( 'mce_buttons', [ $this, 'add_buttons' ] );
		add_filter( 'mce_external_plugins', [ $this, 'register_plugins' ] );
		add_editor_style( URL . 'static/css/editor-plugin.css' );
	}

	public function register_plugins( $plugin_array ) {
		$plugin_array['editor_footnotes'] = URL . '/static/js/editor-plugin.js';
		return $plugin_array;
	}

	public function add_buttons( $buttons ) {
		$buttons[] = 'editor_footnotes';
		return $buttons;
	}
}
