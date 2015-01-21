'use strict';
var App = require('./Page');
var React = require('react');
require('./style.css');
require('../../styles/react-json-editor.css');
require('../../node_modules/react-treeview/react-treeview.css');

document.addEventListener("DOMContentLoaded", function(event) { 
  React.render(React.createElement(App), document.getElementById('root'));
});
