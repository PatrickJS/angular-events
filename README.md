angular-events
==============

Robust and decoupled event pipelining for AngularJS.



### Usage

Register your events with `$eventProvider`:

    angular
      .module('foo')
      .config([
      
        '$eventProvider',
        
        function($eventProvider){
        
          $eventProvider
            .register('foo')
            .register('bar');
        
        }
      
      ]);
      
Then use your events in your module:

    angular
      .module('foo')
      .controller('bar', [
      
        '$events',
        
        function($events){
        
          var hash = $events.on('foo', function(data){ //.on with no filter
          
            console.log('foo anytime!', data);
          
          });
          
          $events.on('foo', {id: 123}, function(data){ //.on, with an optional filter
          
            console.log('foo, but only if data.id is equal to 123', data);
            
          });
          
          $events.once('bar', {id: 456}, function(){ //.once, with an optional filter
          
            console.log('bar, but only if data.id is equal to 456', data);
            
            $events.off('foo', hash); //turn off the first event listener!
            
          });
          
          $events.emit('bar', {id: 456}); //Fire the above listener!
        
        }
      ]);
      
      

