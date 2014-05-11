'use strict';
(function(){

  describe('Provider: $eventsProvider', function() { //describe the controller of the module


    var provider,
        service;

    beforeEach(function(){

      module('angular-events', [

        '$eventsProvider',

        function( p ) {
          provider = p;
        }

      ]);

      inject([

        '$events',

        function(s){
          service = s;
        }

      ]);


    });

    describe('Method: register', function(){

      it('should be a function', function(){
        expect(typeof provider.register).toBe('function');
      });

      it('should create an event namespace', function(){
        provider.register('foo');
        expect(provider._eventHash.foo).not.toBeUndefined();
      });
    });

    describe('Service: $events', function(){

      describe('Method: on', function(){

        beforeEach(function(){
          provider.register('foobar');
        });

        it('is a function', function(){
          expect(typeof service.on).toBe('function');
        });

        it('should return a string hash', function(){
          expect(typeof service.on('foobar', angular.noop)).toBe('string');
        });

        it('should fire an event listener every time the event is emitted, passing the event data payload', function(){
          var cb = jasmine.createSpy('event listener'),
              hash;
          hash = service.on('foobar', cb);
          service.emit('foobar',{foo:'bar'});
          expect(cb).toHaveBeenCalledWith({ //now that it has been flushed, it should have been called!
            foo: 'bar'
          });

          service.off('foobar', hash);

          cb = jasmine.createSpy('event listener');
          hash = service.on('foobar', cb);
          service.emit('foobar',{foo:'bar'});
          expect(cb).toHaveBeenCalledWith({ //now that it has been flushed, it should have been called!
            foo: 'bar'
          });
        });

        it('should only fire a listener until it is turned off', function(){
          var cb = jasmine.createSpy('event listener'),
              hash;

          hash = service.on('foobar', cb);

          service.emit('foobar',{foo: 'bar'});

          expect(cb).toHaveBeenCalledWith({foo: 'bar'});

          service.off('foobar', hash);

          cb = jasmine.createSpy('event listener');

          service.emit('foobar');
          expect(cb).not.toHaveBeenCalled();
        });

        it('should only fire a listener when the event data matches the filter if a filter is supplied', function(){
          var cb = jasmine.createSpy('event listener');

          service.on('foobar', {id: 123}, cb);
          service.emit('foobar',{id: 123});
          expect(cb).toHaveBeenCalledWith({id: 123});
          cb = jasmine.createSpy('event listener');
          service.emit('foobar',{id: 456});
          expect(cb).not.toHaveBeenCalled();
        });
      });

      describe('Method: once', function(){

        beforeEach(function(){
          provider.register('foobar');
        });

        it('is a function', function(){
          expect(typeof service.once).toBe('function');
        });
        it('should return a string hash', function(){
          expect(typeof service.once('foobar',angular.noop)).toBe('string');
        });
        it('should fire an event listener only on the first subsequent time the event is emitted, passing the event data paylaod',function(){
          var cb = jasmine.createSpy('event listener');

          service.once('foobar', cb);

          service.emit('foobar',{foo:'bar'});
          expect(cb).toHaveBeenCalledWith({foo:'bar'});
          cb = jasmine.createSpy('event listener');
          service.emit('foobar');
          expect(cb).not.toHaveBeenCalled();
        });
        it('should only fire a listener if it has not been turned off', function(){
          var cb = jasmine.createSpy('event listener'),
              hash;

          hash = service.once('foobar',cb);
          service.off('foobar',hash);
          service.emit('foobar');
          expect(cb).not.toHaveBeenCalled();
        });
        it('should only fire a listener when the event data matches the filter if a filter is supplied', function(){
          var cb = jasmine.createSpy('event listener');

          service.once('foobar', {id: 123}, cb);
          service.emit('foobar', {id: 123});
          expect(cb).toHaveBeenCalledWith({id: 123});
          cb = jasmine.createSpy('event listener');
          service.once('foobar', {id: 123}, cb);
          service.emit('foobar', {id: 456});
          expect(cb).not.toHaveBeenCalled();
        });
      });

      describe('Method: off', function(){

        beforeEach(function(){
          provider.register('foobar');
        });

        it('is a function', function(){
          expect(typeof service.off).toBe('function');
        });

        it('removes only a specific listener from an event when provided with both an event and a hash',function(){
          var cb1 = jasmine.createSpy('event listener'),
              cb2 = jasmine.createSpy('event listener'),
              hash;

          hash = service.on('foobar',cb1);
          service.on('foobar', cb2);

          service.off('foobar',hash);
          service.emit('foobar');
          expect(cb1).not.toHaveBeenCalled();
          expect(cb2).toHaveBeenCalled();
        });

      });

      describe('Method: emit', function(){

        beforeEach(function(){
          provider.register('foobar');
        });

        it('is a function', function(){
          expect(typeof service.emit).toBe('function');
        });

        it('calls all functions listening for the given event namespace if the event namespace was registered', function(){
          var cb1 = jasmine.createSpy('event listener'),
              cb2 = jasmine.createSpy('event listener'),
              cb3 = jasmine.createSpy('event listener');

          service.on('foobar',cb1);
          service.on('foobar',cb2);

          service.emit('foobar', {foo: 'bar'});

          expect(cb1).toHaveBeenCalledWith({foo: 'bar'});
          expect(cb2).toHaveBeenCalledWith({foo: 'bar'});
          expect(cb3).not.toHaveBeenCalled();

        });
      });
    });
  });

}());
