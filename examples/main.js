var EventEmitter = require('events').EventEmitter;
var DiModular = require('../'); // var DiModular = require('di-modular');

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
  };
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
  }
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
