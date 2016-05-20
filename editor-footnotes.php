<?php
/**
 * Plugin Name: Editor Footnotes
 * Version: 0.1-alpha
 * Description: Adds a footnote implemention into TinyMCE
 * Author: Matthew Boynes
 * Author URI: https://www.alleyinteractive.com/
 * Plugin URI: https://github.com/alleyinteractive/editor-footnotes
 * Text Domain: editor-footnotes
 * Domain Path: /languages
 */
/*
	Copyright 2016 Alley Interactive

	This program is free software; you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation; either version 2 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program; if not, write to the Free Software
	Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
*/

namespace Editor_Footnotes;

define( 'Editor_Footnotes\PATH', __DIR__ );
define( 'Editor_Footnotes\URL', trailingslashit( plugins_url( '', __FILE__ ) ) );

// Load the singleton trait, used by other classes
require_once( \Editor_Footnotes\PATH . '/php/trait-singleton.php' );

/**
 * Autoload Editor_Footnotes classes.
 *
 * @param  string $cls Class name.
 */
function autoload( $cls ) {
	$cls = ltrim( $cls, '\\' );
	if ( strpos( $cls, 'Editor_Footnotes\\' ) !== 0 ) {
		return;
	}

	require_once( \Editor_Footnotes\PATH . '/php/class-' . strtolower( str_replace( [ 'Editor_Footnotes\\', '_' ], [ '', '-' ], $cls ) ) . '.php' );
}
spl_autoload_register( '\Editor_Footnotes\autoload' );

// Load the Editor class on admin pages
add_action( 'admin_init', [ '\Editor_Footnotes\Editor', 'instance' ] );

/**
 * Allow span[data-footnote] to pass through post content.
 *
 * @param  array $kses Allowed HTML tags.
 * @param  string $context Kses context.
 * @return array
 */
function wp_kses_allowed_html( $kses, $context ) {
	if ( 'post' === $context ) {
		$kses['span']['data-footnote'] = true;
	}
	return $kses;
}
add_filter( 'wp_kses_allowed_html', '\Editor_Footnotes\wp_kses_allowed_html', 10, 2 );
