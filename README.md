## angular-events

Robust and decoupled event pipelining for AngularJS.

`angular-events` is not to be confused with `$scope` events.  Rather, it is for creating scalable and modular web components that communicate
with one another using the traditional pub/sub event-driven pattern for loose coupling.  `$scope` events are great for one-off event binding,
but not so great when writing reusable components because the event propogation is coupled to the DOM structure which means that if you move your
component somewhere else on the DOM tree it isn't guaranteed to receive any event.  This is an architectural anti-pattern, as it couples your view to your application logic.


### Architectural Concerns and Explanation

As you will notice in the below documentation, `angular-events` enforces one-time declaration of events by throwing an error when an event is registered more than once, or when an undeclared event is consumed during run time.  This pattern is intentional.  `angular-events` attempts to solve the problem of coupling web components together with an event-driven pattern holistically.  Web components should each expose their own unique event-ful API, and should not inter-depend on other components' APIs or be polluted with code referencing other components.  Instead, you should tie components and their events together in a single point, essentially scripting application and inter-component logic at that level.  This keeps your components clean, loosely-coupled, highly cohesive, and well-factored, allowing for easy reusability.  If this seems like overkill, `angular-events` may not be the right tool for you (or perhaps you don't know how to write scalable apps?).  Anyhow, please feel free to reach out for help.  My email address is listed on my github profile.

### Installation

Install the package via [bower](http://bower.io):

    $ bower install --save angular-events

### Usage

Register your events with `$eventProvider`:

    angular
      .module('foo',[
        'angular-events'
      ])
      .config([
      
        '$eventProvider',
        
        function($eventProvider){
        
          $eventProvider
            .register('foo')
            .register('bar');

          $eventsProvider
            .register('foo'); /*This throws an error, as foo has already been defined!*/
        
        }
      
      ]);
      
Then use your events in your module:

    angular
      .module('foo')
      .controller('bar', [
      
        '$events',
        
        function($events){
        
          var hash = $events.on('foo', function(data){ /* .on with no filter */
          
            console.log('foo anytime!', data);
          
          });
          
          $events.on('foo', {id: 123}, function(data){ /* .on, with an optional filter */
          
            console.log('foo, but only if data.id is equal to 123', data);
            
          });
          
          $events.once('bar', {id: 456}, function(){ /* .once, with an optional filter */
          
            console.log('bar, but only if data.id is equal to 456', data);
            
            $events.off('foo', hash); /* turn off the first event listener! */
            
          });

          $events.on('hello', function(){ /* this throws an error, as hello hasn't been defined */

          });
          
          $events.emit('bar', {id: 456}); /* Fire the above listener! */

          $events.emit('hello', {}); /* This throws an error, as hello hasn't been defined. */
        
        }
      ]);



### API

##### $eventsProvider - Config-Time Injectable

`register(Event String)` - Registers an event listener.  Returns a reference to `$eventsProvider` for chainability


##### $events - Run-Time Injectable


`on(Event String [, Filter Object], Listener Function)` - Binds an event listener to an event string, given an optional filter object.  Returns a listener hash.

`once(Event String [, Filter Object], Listener Function)` - Binds an event listener to an event string, given an optional filter object.  Self-destructs after first invocation of the listener.  Returns a listener hash.
      
`off(Event String, Listener Hash)` - Destroys an event listener for a given event string.

`emit(Event String, Event Data)` - Fires a given Event String passing a given Event Data object.

