# DiModular
Small and versatile framework for developing scalable JavaScript applications.
DiModular is inspired by the [Scalable JavaScript Application Architecture]
(http://www.youtube.com/watch?v=vXjVFPosQHw) presented by by Nicholas Zakas,
also known as the Core-Module-Sanbox pattern. However, instead of a sandbox,
a dependency injection container is used.

## Installation

`$ npm install di-modular`

### Api

#### diModular.register(dependency, value)
Registers value as named dependency.

```js
diModular.register('$someDependency', 'someValue');
```

### diModular.factory(dependency, factory)
Registers factory as named dependency. Factories can lists registered
dependencies in their argument list, which will be injected when the factory
is called.

```js
diModular.factory('$someDependency', function($otherDependency) {
  return {
    someValue: $otherDependency
  };
});
```

An alternative syntax is available that is more resilient to code minifcation
and name mangling, as follows:

```js
diModular.factory('$someDependency', ['$otherDependency', function(a) {
  return {
    someValue: a
  };
}]);
```

#### diModular.get(dependency)
Access named dependency.

#### diModular.module(name, moduleFactory)
Registers a named moduleFactory. Module factories can lists registered
dependencies in their argument list, which will be injected when the module is
instantiated. Modules should implement an `init` method and a `destroy` method,
which will be called as the module is started and stopped respectively.

```js
diModular.module('someModule', function($someDependency) {
  return {
    init: function() {
      // Use $someDependency
    },

    destroy: function() {
      // ...
    }

  }
});
```

#### diModular.start(name[, arg1][, arg2][, ...])
Starts named module. The module's `init` method is called. If provided, optional
arguments are passed to the `init` method.

#### diModular.startAll([, arg1][, arg2][, ...])
Starts all non-running modules. Each started module's `init` method is called.
If provided, optional arguments are passed to each `init` method.

### diModular.stop(name)
Stops named module. The module's `destroy method is called.

### diModular.stopAll()
Stops all running modules. Each stoped module's `destroy` method is called.

### Example

```js
var EventEmitter = require('events').EventEmitter;
var DiModular = require('di-modular');

var modular = new DiModular();

// Register named value dependency
modular.register('$event', new EventEmitter());

// Register named factory dependency
modular.factory('$carFactory', function() {
  return {
    create: function(model) {
      return {
        model: model,
        speed: 10
      };
    }
  }
});

modular.module('honda', function($event, $carFactory) {
  return {
    init: function(opts) {
      this.sound = opts.sound;

      this.car = $carFactory.create('Honda');

      $event.emit('create', this.car);
      $event.on('honk', this.honk = this.honk.bind(this));
    },

    destroy: function() {
      // Do some cleanup, typically remove event listeners.
      $event.removeListener('honk', this.honk);

      $event.emit('destroy', this.car);
    },

    car: null,

    sound: '',

    honk: function() {
      console.log(this.car.model + ' says: "' + this.sound + '!"');
    }
  };
});

// Access the event emitter and listen for `create` event.
modular.get('$event').on('create', function(car) {
  console.log(car.model + ' has been created');
});

// Access the event emitter and listen for `destroy` event.
modular.get('$event').on('destroy', function(car) {
  console.log(car.model + ' has been destroy');
});

// Start module and pass in some options
modular.start('honda', {
  sound: 'Honk, honk'
});

// Access the event emitter and emit `honk` event.
modular.get('$event').emit('honk');

// Stop module
modular.stop('honda');

// Output:
// > honda has been created
// > honda says: "Honk honk!"
// > honda has been destroy
```

## Test

Run unit tests;

`$ npm test`

Create test coverage report:

`$ npm run-script test-cov`

# License

[MIT](LICENSE)
