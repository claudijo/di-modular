var DiContainer = require('di-container');
var inherits = require('inherits');

var DiModular = function() {
  if (!(this instanceof DiModular)) {
    return new DiModular();
  }

  DiContainer.call(this);

  this._modules = {};
};

inherits(DiModular, DiContainer);

DiModular.prototype.module = function(name, factory) {
  this.factory(name, factory);
  this._modules[name] = null;
};

DiModular.prototype.start = function(name, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);

  if (this._modules[name]) {
    return;
  }

  this._modules[name] = this.get(name);
  this._modules[name].init && this._modules[name].init.apply(this._modules[name], args);
};

DiModular.prototype.startAll = function(var_args) {
  var args = Array.prototype.slice.call(arguments) ;
  var module;

  for (module in this._modules) {
    if (this._modules.hasOwnProperty(module)) {
      this.start.apply(this, [module].concat(args));
    }
  }
};

DiModular.prototype.stop = function(name) {
  if (!this._modules[name]) {
    return;
  }
  this._modules[name].destroy && this._modules[name].destroy();
  this._modules[name] = null;
};

DiModular.prototype.stopAll = function() {
  var module;

  for (module in this._modules) {
    if (this._modules.hasOwnProperty(module)) {
      this.stop(module);
    }
  }
};

module.exports = DiModular;
