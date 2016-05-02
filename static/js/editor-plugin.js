tinymce.PluginManager.add('editor_footnotes', function(editor, url) {
  var $ = window.jQuery;

  function getSelectedFootnote() {
    var footnote, html,
      node = editor.selection.getNode(),
      span = editor.dom.getParent( node, 'span[data-footnote]' );

    if ( ! span ) {
      html = editor.selection.getContent({ format: 'raw' });

      if ( html && html.indexOf( '</span>' ) !== -1 ) {
        content = html.match( /data-footnote="([^">]+)"/ );

        if ( content && content[1] ) {
          span = editor.$( 'a[data-footnote="' + content[1] + '"]', node )[0];
        }

        if ( span ) {
          editor.selection.select( span );
        }
      }
    }

    return span;
  }


  // Add a button that opens a window
  editor.addButton('editor_footnotes', {
    icon: 'dashicon dashicons-format-status',
    onclick: function() {
      var footnoteNode = getSelectedFootnote(),
        textarea = {type: 'textbox', name: 'footnote', label: 'Footnote', multiline: true, rows: 3};

      if ( footnoteNode ) {
        textarea.value = editor.dom.getAttrib( footnoteNode, 'data-footnote' );
      }

      // Open window
      editor.windowManager.open({
        title: 'Footnote',
        width: 500,
        height: 110,
        body: [ textarea ],
        onsubmit: function(e) {
          // Insert content when the window form is submitted
          // editor.insertContent('Title: ' + e.data.footnote);

          var text = editor.selection.getContent({ 'format' : 'raw' });

          if (footnoteNode) {
            // if already exists, then don't nest another inside
            footnoteNode.setAttribute('data-footnote', e.data.footnote);
          } else if (text && text.length > 0) {
            var $node = $( '<span class="footnote" />' ).attr( 'data-footnote', e.data.footnote ).text( text );
            editor.insertContent( $node[0].outerHTML );
          }
        }
      });
    },
    onPostRender: function() {
      var self = this;

      editor.on('NodeChange', function(event) {
        self.disabled(!getSelectedFootnote() && '' === editor.selection.getContent());
      });
    }
  });
});
