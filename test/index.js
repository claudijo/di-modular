var assert = require('assert');
var DiModular = require('..');

describe('DiModular', function() {
  var modular;

  beforeEach(function() {
    modular = new DiModular();
  });

  it('should be possible to instantiate without using the new keyboard', function() {
    var newSb = DiModular();
    assert(newSb instanceof DiModular);
  });

  it('should return registered dependency when calling get', function() {
    modular.register('someDependency', 'someValue');
    assert(modular.get('someDependency') === 'someValue');
  });

  it('should return instance from registered factory when calling get', function() {
    modular.factory('someFactory', function() {
      return {
        getSomeValue: function() { return 'someValue'; }
      }
    });
    assert(modular.get('someFactory').getSomeValue() === 'someValue');
  });

  it('should call init on module when starting registered module', function() {
    var callCount = 0;
    modular.module('someModule', function() {
      return {
        init: function() { callCount++; }
      }
    });
    modular.start('someModule');
    assert(callCount === 1);
  });

  it('should invoke init as method when starting registered module', function() {
    var that;
    var someModule = {
      init: function() {
        that = this;
      }
    };
    modular.module('someModule', function() {
      return someModule;
    });
    modular.start('someModule');
    assert(that === someModule);
  });

  it('should call init with arguments provided when starting registered module', function() {
    var firstArgument, secondArgument;
    modular.module('someModule', function() {
      return {
        init: function() {
          firstArgument = arguments[0];
          secondArgument = arguments[1];
        }
      }
    });
    modular.start('someModule', 'firstArgument', 'secondArgument');
    assert(firstArgument === 'firstArgument');
    assert(secondArgument === 'secondArgument');
  });

  it('should not call init when starting already started module', function() {
    var callCount = 0;
    modular.module('someModule', function() {
      return {
        init: function() {
          callCount++;
        }
      }
    });
    modular.start('someModule');
    assert(callCount === 1);
    modular.start('someModule');
    assert(callCount === 1);
  });

  it('should call init on all modules when starting all registered modules', function() {
    var callCount = 0;
    modular.module('firstModule', function() {
      return {
        init: function() { callCount++; }
      };
    });
    modular.module('secondModule', function() {
      return {
        init: function() { callCount++; }
      };
    });
    modular.startAll();
    assert(callCount === 2);
  });

  it('should call init with arguments provided when starting all registered modules', function() {
    var firstModuleArguments, secondModuleArguments;
    modular.module('firstModule', function() {
      return {
        init: function() {
          firstModuleArguments = Array.prototype.slice.call(arguments);
        }
      };
    });
    modular.module('b', function() {
      return {
        init: function() {
          secondModuleArguments = Array.prototype.slice.call(arguments);
        }
      };
    });
    modular.startAll('firstArgument', 'secondArgument');

    assert(firstModuleArguments[0] === 'firstArgument');
    assert(firstModuleArguments[1] === 'secondArgument');
    assert(secondModuleArguments[0] === 'firstArgument');
    assert(secondModuleArguments[1] === 'secondArgument');
  });

  it('should call destroy on module when stopping registered module', function() {
    var callCount = 0;
    modular.module('someModule', function() {
      return {
        destroy: function() { callCount++;}
      }
    });
    modular.start('someModule');
    modular.stop('someModule');
    assert(callCount === 1);
  });

  it('should invoke destroy as method when stopping registered module', function() {
    var that;
    var module = {
      destroy: function() {
        that = this;
      }
    };
    modular.module('someModule', function() {
      return module;
    });
    modular.start('someModule');
    modular.stop('someModule');
    assert(that === module);
  });

  it('should not call destroy on module when module has not been started yet', function() {
    var callCount = 0;
    modular.module('someModule', function() {
      return {
        destroy: function() { callCount++;}
      }
    });
    modular.stop('someModule');
    assert(callCount === 0);
  });

  it('should not call destroy on module when module has already been stopped', function() {
    var callCount = 0;
    modular.module('someModule', function() {
      return {
        destroy: function() { callCount++;}
      }
    });
    modular.start('someModule');
    modular.stop('someModule');
    assert(callCount === 1);
    modular.stop('someModule');
    assert(callCount === 1);
  });

  it('should call destroy on all modules when stopping all registered and started modules', function() {
    var callCount = 0;
    modular.module('firstModule', function() {
      return {
        destroy: function() { callCount++; }
      };
    });
    modular.module('secondModule', function() {
      return {
        destroy: function() { callCount++; }
      };
    });
    modular.startAll();
    modular.stopAll();
    assert(callCount === 2);
  });

  it('should inject registered dependency', function() {
    var someDependency;
    modular.register('$someDependency', 'someValue');
    modular.module('someModule', function($someDependency) {
      return {
        init: function() {
          someDependency = $someDependency;
        }
      }
    });
    modular.start('someModule');
    assert(someDependency === 'someValue');
  });

  it('should inject instances from registered factory', function() {
    var someValue;
    modular.factory('$someFactory', function() {
      return {
        someValue: 'someValue'
      };
    });
    modular.module('someModule', function($someFactory) {
      return {
        init: function() {
          someValue = $someFactory.someValue;
        }
      }
    });
    modular.start('someModule');
    assert(someValue === 'someValue');
  });
});
