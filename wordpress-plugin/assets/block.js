(function (blocks, element, editor, components) {
  var el = element.createElement;
  var registerBlockType = blocks.registerBlockType;
  var InspectorControls = editor.InspectorControls;
  var TextControl = components.TextControl;
  var PanelBody = components.PanelBody;

  registerBlockType('mybooking/widget', {
    title: 'MyBooking Widget',
    icon: 'calendar-alt',
    category: 'widgets',
    attributes: {
      event_id: {
        type: 'string',
        default: mybookingSettings.defaultEventId || '',
      },
      width: {
        type: 'string',
        default: '100%',
      },
      height: {
        type: 'string',
        default: '600px',
      },
    },

    edit: function (props) {
      var attributes = props.attributes;
      var setAttributes = props.setAttributes;

      return el(
        'div',
        {},
        el(
          InspectorControls,
          {},
          el(
            PanelBody,
            { title: 'Widget Settings', initialOpen: true },
            el(TextControl, {
              label: 'Event ID',
              value: attributes.event_id,
              onChange: function (value) {
                setAttributes({ event_id: value });
              },
              help: 'The ID of the event type to display',
            }),
            el(TextControl, {
              label: 'Width',
              value: attributes.width,
              onChange: function (value) {
                setAttributes({ width: value });
              },
              help: 'Widget width (e.g., 100%, 800px)',
            }),
            el(TextControl, {
              label: 'Height',
              value: attributes.height,
              onChange: function (value) {
                setAttributes({ height: value });
              },
              help: 'Widget height (e.g., 600px, auto)',
            })
          )
        ),
        el(
          'div',
          {
            className: 'mybooking-block-preview',
            style: {
              padding: '20px',
              border: '2px dashed #ccc',
              borderRadius: '4px',
              textAlign: 'center',
              backgroundColor: '#f5f5f5',
            },
          },
          el('div', { className: 'dashicons dashicons-calendar-alt', style: { fontSize: '48px', opacity: 0.5 } }),
          el('h3', {}, 'MyBooking Widget'),
          el('p', {}, 'Event ID: ' + (attributes.event_id || 'Not set')),
          el('p', {}, 'Size: ' + attributes.width + ' × ' + attributes.height),
          el(
            'small',
            { style: { color: '#666' } },
            'The booking widget will appear here on the frontend'
          )
        )
      );
    },

    save: function () {
      // Handled by PHP render callback
      return null;
    },
  });
})(window.wp.blocks, window.wp.element, window.wp.blockEditor || window.wp.editor, window.wp.components);
