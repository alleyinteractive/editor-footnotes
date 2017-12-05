( function( tinymce ) {
  tinymce.ui.Factory.add( 'footnotePreview', tinymce.ui.Control.extend( {
    stub: '(empty)',
    renderHtml: function() {
      return (
        '<div id="' + this._id + '" class="footnote-preview">' +
          '<span>' + this.stub + '</span>' +
        '</div>'
      );
    },
    setFootnoteStub: function ( text ) {
      var limit = 40,
          stub = ( text && text.length > limit ) ? text.slice( 0, limit ) + '\u2026' : text;

      tinymce.$( this.getEl().firstChild ).text( stub );
    }
  } ) );

  tinymce.ui.Factory.add( 'footnoteInput', tinymce.ui.Control.extend( {
    renderHtml: function() {
      return (
        '<div id="' + this._id + '" class="footnote-input">' +
          '<textarea rows="5" placeholder="' +
          tinymce.translate( 'Enter Footnote' ) + '"></textarea>' +
        '</div>'
      );
    },
    getFootnoteText: function() {
      var text = this.getEl().firstChild.value || '';

      if ( ! tinymce.trim( text ) ) {
        return '';
      }

      return text;
    },
    setFootnoteText: function(text) {
      this.getEl().firstChild.value = text;
    },
    reset: function() {
      var footnoteInput = this.getEl().firstChild;

      footnoteInput.value = '';
    }
  } ) );

  tinymce.PluginManager.add('editor_footnotes', function( editor ) {
    var toolbar;
    var editToolbar;
    var previewInstance;
    var inputInstance;
    var footnoteNode;
    var $ = window.jQuery;

    function getSelectedFootnote() {
      var content, html,
        node = editor.selection.getNode(),
        span = editor.dom.getParent( node, 'span[data-footnote]' );

      if ( ! span ) {
        html = editor.selection.getContent( { format: 'raw' } );

        if ( html && html.indexOf( '</span>' ) !== -1 ) {
          content = html.match( /data-footnote="([^">]+)"/ );

          if ( content && content[1] ) {
            span = editor.$( 'span[data-footnote="' + content[1] + '"]', node )[0];
          }

          if ( span ) {
            editor.selection.select( span );
          }
        }
      }

      return span;
    }

    function setPlaceholder() {
      var text, $placeholder;
      text = editor.selection.getContent( { format: 'raw' } );
      $placeholder = $( '<span class="footnote" />' ).attr( 'data-footnote-edit', true )
                                                     .attr( 'data-footnote', '' )
                                                     .text( text );

      editor.insertContent( $placeholder[0].outerHTML );

      return editor.$( 'span[data-footnote-edit]' )[0];
    }

    function removePlaceholders() {
      editor.$( 'span.footnote' ).each( function( i, element ) {
        var $element = editor.$( element );

        if ( $element.attr( 'data-footnote' ) === '' ) {
          editor.dom.remove( element, true );
        } else if ( $element.attr( 'data-footnote-edit' ) ) {
          $element.attr( 'data-footnote-edit', null );
        }
      } );
    }

    editor.on( 'preinit', function() {
      if ( editor.wp && editor.wp._createToolbar ) {
        toolbar = editor.wp._createToolbar( [
          'footnote_preview',
          'footnote_edit',
          'footnote_remove'
        ], true );

        var editButtons = [
          'footnote_input',
          'footnote_apply'
        ];

        editToolbar = editor.wp._createToolbar( editButtons, true );

        editToolbar.on( 'show', function() {
          window.setTimeout( function() {
            var element = editToolbar.$el.find( 'textarea' )[0];

            if ( element ) {
              element.focus();
              element.select();
            }
          } );
        } );

        editToolbar.on( 'hide', function() {
          editor.execCommand( 'footnote_cancel' );
        } );
      }
    } );

    editor.addCommand( 'footnote_edit', function() {
      footnoteNode = getSelectedFootnote();

      if ( footnoteNode ) {
        editor.dom.setAttribs( footnoteNode, { 'data-footnote-edit': true } );
      } else {
        removePlaceholders();
        footnoteNode = setPlaceholder();
        editor.selection.select(footnoteNode);
        editor.nodeChanged();
      }
    } );

    editor.addCommand( 'footnote_apply', function() {
      var text;

      if ( footnoteNode ) {
        text = inputInstance.getFootnoteText();
        editor.focus();

        if (text) {
          editor.dom.setAttribs( footnoteNode, { 'data-footnote': text, 'data-footnote-edit': null } );
        } else {
          editor.execCommand('footnote_remove');
        }
      }

      inputInstance.reset();
      editor.nodeChanged();
    } );

    editor.addCommand( 'footnote_cancel', function() {
      inputInstance.reset();
      removePlaceholders();
      editor.focus();
    } );

    editor.addCommand( 'footnote_remove', function() {
      editor.dom.remove( footnoteNode, true );
      removePlaceholders();
    } );

    editor.addButton('editor_footnotes', {
      icon: 'dashicon dashicons-format-status',
      tooltip: 'Insert Footnote',
      stateSelector: 'span.footnote',
      cmd: 'footnote_edit',
      onPostRender: function() {
        var self = this;

        // only enable on some kind of selection
        editor.on( 'NodeChange', function( event ) {
          self.disabled( !getSelectedFootnote() && '' === editor.selection.getContent() );
        });
      }
    } );

    editor.addButton( 'footnote_preview', {
      type: 'footnotePreview',
      onPostRender: function() {
        previewInstance = this;
      }
    } );

    editor.addButton( 'footnote_input', {
      type: 'footnoteInput',
      onPostRender: function() {
        var element = this.getEl(),
          input = element.firstChild;

        inputInstance = this;

        tinymce.$( input ).on( 'keydown', function( event ) {
          if ( event.keyCode === 13 ) {
            editor.execCommand( 'footnote_apply' );
            event.preventDefault();
          }
        } );
      }
    } );

    editor.on( 'wptoolbar', function( event ) {
      var $footnoteNode, footnoteText, edit;

      footnoteNode = editor.dom.hasClass(event.element, 'footnote') ? event.element :
        editor.dom.getParent( event.element, 'span.footnote' );

      if ( footnoteNode ) {
        $footnoteNode = editor.$( footnoteNode );
        footnoteText = $footnoteNode.attr( 'data-footnote' );
        edit = $footnoteNode.attr( 'data-footnote-edit' );

        if ( edit ) {
          if ( footnoteText ) {
            inputInstance.setFootnoteText( footnoteText );
          }
          event.element = footnoteNode;
          event.toolbar = editToolbar;
        } else {
          previewInstance.setFootnoteStub( footnoteText );
          event.element = footnoteNode;
          event.toolbar = toolbar;
        }
      }
    } );

    editor.addButton( 'footnote_edit', {
      tooltip: 'Edit ', // trailing space as per wp_link_edit plugin
      icon: 'dashicon dashicons-edit',
      cmd: 'footnote_edit'
    } );

    editor.addButton( 'footnote_remove', {
      tooltip: 'Remove',
      icon: 'dashicon dashicons-no',
      cmd: 'footnote_remove'
    } );

    editor.addButton( 'footnote_apply', {
      tooltip: 'Apply',
      icon: 'dashicon dashicons-editor-break',
      cmd: 'footnote_apply',
      classes: 'widget btn primary'
    } );

    return {
      close: function() {
        // editToolbar.tempHide = false;
        editor.execCommand( 'footnote_cancel' );
      }
    };
  } );
} )( window.tinymce );
