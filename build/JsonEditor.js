"use strict";
var _ = require("lodash");
var React = require("react");
var Cursor = require("react-cursor").Cursor;
var TreeView = require("react-treeview");

var JsonEditor = React.createClass({
  displayName: "JsonEditor",
  propTypes: {
    nodeLabel: React.PropTypes.string,
    targetCursor: React.PropTypes.object.isRequired,
    toggleOnDoubleClick: React.PropTypes.bool,
    canToggle: React.PropTypes.bool
  },
  getDefaultProps: function () {
    return {
      nodeLabel: "root",
      targetCursor: undefined, // the app state that we're targetting
      toggleOnDoubleClick: false,
      canToggle: true
    };
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    var unchanged =
    // cursor is a special object with function values - not JSON serializable
    _.isEqual(_.omit(this.props, "targetCursor"), _.omit(nextProps, "targetCursor")) &&
    // but the JsonEditor understands cursors so we can do the right thing
    _.isEqual(this.props.targetCursor.value, nextProps.targetCursor.value) && _.isEqual(this.state, nextState);
    return !unchanged;
  },

  render: function () {
    var editorCursor = this.props.targetCursor; //Cursor.build(this.state, this.setState.bind(this), _.cloneDeep);
    var tree = buildConfig(editorCursor);

    return React.createElement(
      "div",
      { className: "JsonEditor" },
      tree
    );
  }
});



var JsonLeafEditor = React.createClass({
  displayName: "JsonLeafEditor",
  getDefaultProps: function () {
    return {
      cursor: undefined
    };
  },

  getInitialState: function () {
    // Stringified value includes "type" - e.g. strings are quoted.
    return {
      jsValue: JSON.stringify(this.props.cursor.value, undefined, 2),
      editing: false
    };
  },

  componentWillReceiveProps: function (nextProps) {
    this.setState({
      jsValue: JSON.stringify(nextProps.cursor.value, undefined, 2)
    });
  },

  render: function () {
    var classes = _.compact(["JsonLeafEditor", this.isDirty() ? "dirty" : null, !this.isValid() ? "invalid" : null]);

    var leaf = this.state.editing ? [React.createElement("input", { key: "0", value: this.state.jsValue, onChange: this.onChange, style: { background: "transparent" } }), React.createElement(
      "button",
      { key: "1", onClick: this.commit, disabled: !this.isValid() },
      "commit"
    )] : [React.createElement(
      "code",
      { key: "2", className: "editButton", onClick: this.edit },
      this.state.jsValue
    )];

    return React.createElement(
      "span",
      { className: classes.join(" ") },
      leaf
    );
  },

  onChange: function (e) {
    this.setState({ jsValue: e.target.value });
  },

  commit: function () {
    this.props.cursor.onChange(JSON.parse(this.state.jsValue));
    this.setState({ editing: false });
  },

  edit: function () {
    this.setState({ editing: true });
  },

  isValid: function () {
    try {
      JSON.parse(this.state.jsValue);
      return true;
    } catch (e) {
      return false;
    }
  },

  isDirty: function () {
    if (!this.isValid()) return false; // we're invalid, not dirty
    var unmodified = _.isEqual(JSON.parse(this.state.jsValue), this.props.cursor.value);
    return !unmodified;
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    return !(_.isEqual(this.props.cursor.value, nextProps.cursor.value) && _.isEqual(this.state, nextState));
  }
});


// time to parse it into a format the tree view recognizes
// [
//   {displayNode: bla, children: [bla, bla]},
//   {displayNode: bla, children: [bla, bla]},
// ]

function buildConfigArray(nodes) {
  // array of cursors
  // convert the array into an object where the key is the index
  var xs = _.object(_.map(nodes, function (node, i) {
    return [i, node];
  }));

  return _.map(xs, buildConfigObject); // recursion
}

function buildConfigObject(cursor, key) {
  var node = cursor.value;
  // node is an: object, array, or primitive
  // if its an array, we need to turn it into a map, and name each element in the array

  if (node instanceof Array) {
    // expand Cursor[List[T]] into List[Cursor[T]]
    var acc = [];
    _.each(cursor.value, function (el, i) {
      acc.push(cursor.refine(i));
    });

    return React.createElement(
      TreeView,
      { nodeLabel: displayNodeLabel(key + " [" + node.length + "]") },
      buildConfigArray(acc)
    );
  } else if (node instanceof Object) {
    // {a:'a', b:'b'}
    return React.createElement(
      TreeView,
      { nodeLabel: displayNodeLabel(key) },
      mapCursorKV(cursor, buildConfigObject)
    );
  } else {
    // primitive
    return displayLeaf(key, cursor);
  }
}

function buildConfig(rootNode) {
  if (rootNode instanceof Array) return buildConfigArray(rootNode);
  return buildConfigObject(rootNode, "root");
}

function displayLeaf(key, cursor) {
  return React.createElement(
    "div",
    { key: key },
    React.createElement(
      "code",
      null,
      key,
      ": "
    ),
    React.createElement(JsonLeafEditor, { cursor: cursor })
  );
}

function displayNodeLabel(label) {
  return React.createElement(
    "code",
    { key: label },
    label
  );
}

function mapCursorKV(cursor, f) {
  // map over the kv pairs, using f(cursor.refine[key], key) rather than f(obj[key], key)
  var acc = [];
  _.each(_.keys(cursor.value), function (key) {
    var val = f(cursor.refine(key), key);
    acc.push(val); // not [key, val]
  });
  return acc; // like _.map, it is call site's responsibility to call _.object if desired
}



module.exports = JsonEditor;
/* recursion */