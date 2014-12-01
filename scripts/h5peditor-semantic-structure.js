/** @namespace H5PEditor */
var H5PEditor = H5PEditor || {};

H5PEditor.SemanticStructure = (function ($) {
  var self = this;

  /**
   * The base of the semantic structure system.
   * All semantic structure class types will inherit this class.
   *
   * @class
   */
  function SemanticStructure(field) {
    var self = this;

    // Initialize event inheritance
    H5P.EventDispatcher.call(self);

    /**
     * Global instance variables.
     * @private
     */
    var $widgetSelect, $wrapper, $errors, $description, $helpText, widgets;

    /**
     * Initialize. Wrapped to avoid leaking variables
     * @private
     */
    var init = function () {
      widgets = getValidWidgets();

      if (widgets.length > 1) {
        // Create widget select box
        $widgetSelect = $('<select/>').change(function () {
          changeWidget($widgetSelect.val());
        });
        for (var i = 0; i < widgets.length; i++) {
          var widget = widgets[i];
          $('<option/>', {
            value: widget.name,
            text: widget.label
          }).appendTo($widgetSelect);
        }
      }

      // Create field wrapper
      $wrapper = $('<div/>', {
        'class': 'field ' + field.type
      });

      /* We want to be in control of the label, description and errors
      containers to give the editor some structure. Also we do not provide
      direct access to the field object to avoid cluttering semantics.json with
      non-semantic properties and options. Getters and setters will be
      created for what is needed. */

      // Create field label
      if (field.label !== 0) {
        // Add label
        $('<label/>', {
          'class': 'h5peditor-label',
          text: (field.label === undefined ? field.name : field.label)
        });
      }

      // Create errors container
      $errors = $('<div/>', {
        'class': 'h5p-errors'
      });

      // Create description
      if (field.description !== undefined) {
        $description = $('<div/>', {
          'class': 'h5peditor-field-description',
          text: field.description
        });
      }

      // Create help text
      $helpText = $('<div/>', {
        'class': 'h5p-help-text'
      });
    };

    /**
     * Get a list of widgets that are valid and loaded.
     *
     * @private
     * @throws {TypeError} widgets must be an array
     * @returns {Array} List of valid widgets
     */
    var getValidWidgets = function () {
      if (field.widgets === undefined) {
        // No widgets specified use default
        return [self.default];
      }
      if (!(field.widgets instanceof Array)) {
        throw TypeError('widgets must be an array');
      }

      // Check if specified widgets are valid
      var validWidgets = [];
      for (var i = 0; i < field.widgets.length; i++) {
        var widget = field.widgets[i];
        if (getWidget(widget.name)) {
          validWidgets.push(widget);
        }
      }

      if (!validWidgets.length) {
        // There are no valid widgets, add default
        validWidgets.push(self.default);
      }

      return validWidgets;
    };

    /**
     * Finds the widget class with the given name.
     *
     * @private
     * @param {String} name
     * @returns {Class}
     */
    var getWidget = function (name) {
      return H5PEditor[name];
    };

    /**
     * Change the UI widget.
     *
     * @private
     * @param {String} name
     */
    var changeWidget = function (name) {
      if (self.widget !== undefined) {
        // Remove old widgets
        self.widget.remove();
      }

      // TODO: Handle/catch errors?
      var widget = getWidget(name);
      self.widget = new widget(self);
      self.trigger('changeWidget');
      self.widget.appendTo($wrapper);

      // Add errors container and description.
      $errors.appendTo($wrapper);
      if ($description !== undefined) {
        $description.appendTo($wrapper);
      }
      if (self.widget.helpText !== undefined) {
        $helpText.text(self.widget.helpText).appendTo($wrapper);
      }
    };

    /**
     * Appends the field widget to the given container.
     *
     * @public
     * @param {jQuery} $container
     */
    self.appendTo = function ($container) {
      if ($widgetSelect) {
        // Add widget select box
        $widgetSelect.appendTo($container);
      }

      // Use first widget by default
      changeWidget(widgets[0].name);

      $wrapper.appendTo($container);
    };

    /**
     * Remove this field and widget.
     *
     * @public
     */
    self.remove = function () {
      self.widget.remove();
    };

    // Must be last
    init();
  }

  // Extends the event dispatcher
  SemanticStructure.prototype = Object.create(H5P.EventDispatcher.prototype);
  SemanticStructure.prototype.constructor = SemanticStructure;

  return SemanticStructure;
})(H5P.jQuery);