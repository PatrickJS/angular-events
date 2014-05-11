'use strict';

angular
  .module('angular-events',[
  ]);
;'use strict';

angular
  .module('angular-events')
  .provider('$events',[

    function(){


      // Here, we are creating two separate namespaces.  publicMembers will be exposed as the injectable content within config blocks,
      // whereas privateMembers are only accessible within this closure.
      var publicMembers = {},
          privateMembers = {};


      /*  This event hash will store hashes of event listeners like so:

          publicMembers._eventHash['foo'][123] = function(data){ console.log(data); };
          Where 'foo' is the event name, 123 is the event listener ID (generated by generateListenerhash),
          and the function is the actual event listener.  In the case that the listener registration passed a filter object,
          the listener itself is wrapped in yet another function like so:

          var eventId = events.on('foo', {id: 173}, function(){
            console.log('hello world');
          });

          console.log(eventId); // => 456 or whatever generateListenerHash creates

          Which equates to:

          publicMembers._eventHash['foo'][456] = function(data){
            if(data.id === 173){
              (function(){
                console.log('hello world');
              }());
            }
          };

          with respect to scope, which obviously isn't warped in this manner.  JavaScript scope reference is still retained.

      */


      publicMembers._eventHash = {};


      // This is a counter that is used by generateListenerHash to create event hash IDs
      privateMembers.counter = 0;


      // This function creates unique identifiers which are returned from 'on' and 'once' and point to that particular event listener,
      // Allowing the engineer to pass this id into 'off' to disable the listener.  In essence, they act as a pointer to an event listener
      privateMembers.generateListenerHash = function(){
        privateMembers.counter = (privateMembers.counter === 9007199254740992) ? 0 : privateMembers.counter; //handle overflow
        return (privateMembers.counter++) + '';
      };




      // This function executes event listeners which are associated with a given event, passing in the data to the event handlers
      // All event handlers share the same reference to the data, so if one event handler alters the data then every other event handler
      // will also receive the altered data (think ExpressJS middleware
      privateMembers.execute = function(name, data){
        var hash;
        for(hash in publicMembers._eventHash[name]){
          if(publicMembers._eventHash[name].hasOwnProperty(hash)){
            publicMembers._eventHash[name][hash](data);
          }
        }
      };




      // This function registers an event to be used.  If the event is already registered, this method throws an error.  This enforces intermodule
      // event encapsulation by restricting engineers from redeclaring external events locally due to misunderstanding.
      publicMembers.register = function(name){
        if(!publicMembers._eventHash[name]){
          publicMembers._eventHash[name] = {};
        }
        else{
          throw new Error('Event \''+name+'\' has already been defined');
        }

        return this;
      };



      // In Angular, $get is what is passed from a provider to the $injector to configure an instance of the service.  Everything else here is part of the provider.
      // $get uses Array Notation to specify injectables, just like you would do when creating a service or controller.
      publicMembers.$get = [

        function(){

          // Providers use the factory pattern (angular.module('foo').factory(...)) with the injector to create instances.  So you can think of everything
          // inside $get as angular.module('foo').factory :)
          // As such, we need to return the publicly exposed members of this service
          return {

            // 'on' is passed a name, a filter (optional), and a listener which binds the listener to the event name, optionally under the
            // constraints of the filter.  It returns an event listener ID.
            on: function(name, filter, listener){


              var hash, // hash will be returned, and will simply be the event listener ID
                  type, // type will resolve to the type of the event listener for sanity check
                  self = this; // self will be a mountpoint for 'this', both for performance and for child-scope usage

              listener = listener || filter; // If there is no filter, then the filter variable will be the event listener and listener should be undefined

              type = typeof listener; // Here we resolve the type of the listener for the sanity check

              if(type !== 'function'){ // Here we perform the sanity check to make sure our listener is in fact a function
                throw new Error('\'on\' expected type \'function\' for a listener, and instead received type \''+type+'\'');
              }

              if(publicMembers._eventHash[name]){ // Here, we check to see if the event has indeed been registered.
                hash = privateMembers.generateListenerHash();
                publicMembers._eventHash[name][hash] = (function(listener){ // Here we wrap the listener in a closure so we can delete the closure without deleting the function that is passed by reference into the routine
                  return function(data){ // This is the 'actual' listener that gets called, and in turn calls the event listener passed into the method

                    var pass = true, // Lets assume that there either is no filter or that the filter is passing already
                        i;
                    if(typeof filter !== typeof listener){ // Now, if our filter from above isn't also our listener, lets assume its an object and iterate over it to make sure our data meets the filter criteria
                      for(i in filter){

                        if(filter.hasOwnProperty(i)){
                          pass = (filter[i] === data[i]); // If our data meets our filter criteria, pass remains true.  Otherwise, pass becomes false

                          if(!pass){ // If pass becomes false, we break from the loop
                            break;
                          }
                        }

                      }
                    }

                    if(pass){ // If pass is still true, we actually invoke the real listener.  Otherwise we don't respond to the event
                      listener.apply(self, arguments);
                    }
                  };
                }(listener));
              }
              else{ // If the event hasn't been registered during config time, we want to throw an error as we want our events to be very declarative
                throw new Error('\''+name+'\' not found in event registry');
              }

              return hash; //Return the event listener ID
            },

            // 'once' works just like once, except it calls 'off' on the listener ID that it returns after it's listener gets invoked.
            once: function(name, filter, listener){
              var hash,
                  type,
                  self = this;

              listener = listener || filter;

              type = typeof listener;

              if(type !== 'function'){ // Here we perform the sanity check to make sure our listener is in fact a function
                throw new Error('\'once\' expected type \'function\' for a listener, and instead received type \''+type+'\'');
              }

              if(publicMembers._eventHash[name]){
                hash = privateMembers.generateListenerHash();
                publicMembers._eventHash[name][hash] = (function(listener, hash){ //wrap so we can delete without deleting the function that is passed
                  return function(data){
                    var pass = true,
                        i;
                    if(typeof filter !== typeof listener){
                      for(i in filter){
                        if(filter.hasOwnProperty(i)){
                          pass = (filter[i] === data[i]);

                          if(!pass){
                            break;
                          }

                        }
                      }
                    }
                    if(pass){
                      listener.apply(self, arguments);
                      self.off(name,hash);
                    }
                  };
                }(listener, hash));
              }
              else{
                throw new Error('Event \''+name+'\' is undefined');
              }
              return hash;
            },

            // 'off' turns on a particular event listener given an event name (name) and an event listener id (hash)
            off: function(name, hash){
              if(publicMembers._eventHash[name]){ // First, make sure that the event has been registered

                if(!hash){ // First we want to sanity check to make sure a hash was passed
                  throw new Error('\'off\' expected to be passed a hash and didn\'t receive one'); //throw an error if a hash wasn't passed
                }
                else{ // If a hash was passed, we only want to turn off that event listener
                  if(publicMembers._eventHash[name][hash]){ // assuming that the hash is even valid!
                    delete publicMembers._eventHash[name][hash];
                  }
                }
              }
              else{
                throw new Error('Event \''+name+'\' is undefined'); // Throw an error if the event wasn't registered during the config phase
              }
            },

            // 'emit' fires an event, executing it's listeners and dispatching a data payload (optional) to each listener which can be filtered per listener
            emit: function(name, data){
              if(!publicMembers._eventHash[name]){ // Throw an error if the event wasn't registered during the config phase
                throw new Error('Event \''+name+'\' is undefined');
              }
              else{ // If the event was registered, defer to privateMembers.execute passing the event name and the data payload (optional)
                privateMembers.execute(name, data);
              }
            }
          };

        }
      ];



      return publicMembers;

    }


  ]);
