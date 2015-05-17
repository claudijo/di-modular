var assert = require('assert');
var Smorgasboard = require('..');

describe('Smorgasboard', function() {
  var sb;

  beforeEach(function() {
    sb = new Smorgasboard();
  });

  it('should be possible to instantiate without using the new keyboard', function() {
    var newSb = Smorgasboard();
    assert(newSb instanceof Smorgasboard);
  });

  it('should return registered dependency when calling get', function() {
    sb.register('someDependency', 'someValue');
    assert(sb.get('someDependency') === 'someValue');
  });

  it('should return instance from registered factory when calling get', function() {
    sb.factory('someFactory', function() {
      return {
        getSomeValue: function() { return 'someValue'; }
      }
    });
    assert(sb.get('someFactory').getSomeValue() === 'someValue');
  });

  it('should call init on module when starting registered module', function() {
    var callCount = 0;
    sb.module('someModule', function() {
      return {
        init: function() { callCount++; }
      }
    });
    sb.start('someModule');
    assert(callCount === 1);
  });

  it('should invoke init as method when starting registered module', function() {
    var that;
    var someModule = {
      init: function() {
        that = this;
      }
    };
    sb.module('someModule', function() {
      return someModule;
    });
    sb.start('someModule');
    assert(that === someModule);
  });

  it('should call init with arguments provided when starting registered module', function() {
    var firstArgument, secondArgument;
    sb.module('someModule', function() {
      return {
        init: function() {
          firstArgument = arguments[0];
          secondArgument = arguments[1];
        }
      }
    });
    sb.start('someModule', 'firstArgument', 'secondArgument');
    assert(firstArgument === 'firstArgument');
    assert(secondArgument === 'secondArgument');
  });

  it('should not call init when starting already started module', function() {
    var callCount = 0;
    sb.module('someModule', function() {
      return {
        init: function() {
          callCount++;
        }
      }
    });
    sb.start('someModule');
    assert(callCount === 1);
    sb.start('someModule');
    assert(callCount === 1);
  });

  it('should call init on all modules when starting all registered modules', function() {
    var callCount = 0;
    sb.module('firstModule', function() {
      return {
        init: function() { callCount++; }
      };
    });
    sb.module('secondModule', function() {
      return {
        init: function() { callCount++; }
      };
    });
    sb.startAll();
    assert(callCount === 2);
  });

  it('should call init with arguments provided when starting all registered modules', function() {
    var firstModuleArguments, secondModuleArguments;
    sb.module('firstModule', function() {
      return {
        init: function() {
          firstModuleArguments = Array.prototype.slice.call(arguments);
        }
      };
    });
    sb.module('b', function() {
      return {
        init: function() {
          secondModuleArguments = Array.prototype.slice.call(arguments);
        }
      };
    });
    sb.startAll('firstArgument', 'secondArgument');

    assert(firstModuleArguments[0] === 'firstArgument');
    assert(firstModuleArguments[1] === 'secondArgument');
    assert(secondModuleArguments[0] === 'firstArgument');
    assert(secondModuleArguments[1] === 'secondArgument');
  });

  it('should call destroy on module when stopping registered module', function() {
    var callCount = 0;
    sb.module('someModule', function() {
      return {
        destroy: function() { callCount++;}
      }
    });
    sb.start('someModule');
    sb.stop('someModule');
    assert(callCount === 1);
  });

  it('should invoke destroy as method when stopping registered module', function() {
    var that;
    var module = {
      destroy: function() {
        that = this;
      }
    };
    sb.module('someModule', function() {
      return module;
    });
    sb.start('someModule');
    sb.stop('someModule');
    assert(that === module);
  });

  it('should not call destroy on module when module has not been started yet', function() {
    var callCount = 0;
    sb.module('someModule', function() {
      return {
        destroy: function() { callCount++;}
      }
    });
    sb.stop('someModule');
    assert(callCount === 0);
  });

  it('should not call destroy on module when module has already been stopped', function() {
    var callCount = 0;
    sb.module('someModule', function() {
      return {
        destroy: function() { callCount++;}
      }
    });
    sb.start('someModule');
    sb.stop('someModule');
    assert(callCount === 1);
    sb.stop('someModule');
    assert(callCount === 1);
  });

  it('should call destroy on all modules when stopping all registered and started modules', function() {
    var callCount = 0;
    sb.module('firstModule', function() {
      return {
        destroy: function() { callCount++; }
      };
    });
    sb.module('secondModule', function() {
      return {
        destroy: function() { callCount++; }
      };
    });
    sb.startAll();
    sb.stopAll();
    assert(callCount === 2);
  });

  it('should inject registered dependency', function() {
    var someDependency;
    sb.register('$someDependency', 'someValue');
    sb.module('someModule', function($someDependency) {
      return {
        init: function() {
          someDependency = $someDependency;
        }
      }
    });
    sb.start('someModule');
    assert(someDependency === 'someValue');
  });

  it('should inject instances from registered factory', function() {
    var someValue;
    sb.factory('$someFactory', function() {
      return {
        someValue: 'someValue'
      };
    });
    sb.module('someModule', function($someFactory) {
      return {
        init: function() {
          someValue = $someFactory.someValue;
        }
      }
    });
    sb.start('someModule');
    assert(someValue === 'someValue');
  });
});
