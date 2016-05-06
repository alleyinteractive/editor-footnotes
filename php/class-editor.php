<?php
namespace Editor_Footnotes;

/**
 * Homepage controller
 */
class Editor {
	use Singleton;

	/**
	 * Setup the singleton.
	 */
	public function setup() {
		add_filter( 'mce_buttons', [ $this, 'add_buttons' ] );
		add_filter( 'mce_external_plugins', [ $this, 'register_plugins' ] );
		add_action( 'wp_enqueue_editor', [ $this, 'wp_enqueue_editor' ] );
	}

	/**
	 * Register this TinyMCE plugin.
	 *
	 * @param  array $plugin_array Array of plugins
	 * @return array
	 */
	public function register_plugins( $plugin_array ) {
		$plugin_array['editor_footnotes'] = URL . '/static/js/editor-plugin.js';
		return $plugin_array;
	}

	/**
	 * Add the footnotes icon to the toolbar.
	 *
	 * @param array $buttons Toolbar buttons.
	 */
	public function add_buttons( $buttons ) {
		if ( false !== ( $insert_point = array_search( 'unlink', $buttons ) ) ) {
			array_splice( $buttons, $insert_point + 1, 0, 'editor_footnotes' );
		} else {
			$buttons[] = 'editor_footnotes';
		}
		return $buttons;
	}

	/**
	 * Enqueue the required CSS when WP enqueues the editor scripts and styles.
	 */
	public function wp_enqueue_editor() {
		wp_enqueue_style( 'editor-footnotes-css', URL . '/static/css/editor-plugin.css', [], '0.1' );
	}
}
