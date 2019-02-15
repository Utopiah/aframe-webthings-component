var token = 'Bearer eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjhkY2UwZWY4LTM3OTgtNDI4MC1hNDRlLTA5ODQzY2ZiYjNiZiJ9.eyJjbGllbnRfaWQiOiJsb2NhbC10b2tlbiIsInJvbGUiOiJhY2Nlc3NfdG9rZW4iLCJzY29wZSI6Ii90aGluZ3M6cmVhZHdyaXRlIiwiaWF0IjoxNTQ5OTYxMDcwLCJpc3MiOiJodHRwczovL3Nvc2cubW96aWxsYS1pb3Qub3JnIn0.FHcrBxVZA4ZlozK08p5W2tBI_t0dYdGXtDL3Z8ITmBwWfocsypD5gkseDLDMWKKRGf5gkd55q9RY8_5MiApYXg'
// token = '' // testing token not set
var baseURL = 'https://sosg.mozilla-iot.org/'
var debug = false // used to display content in the console

AFRAME.registerComponent('iot-periodic-read-values', {
  init: function () {
    if ( !token || token.length < 10 ) {
      console.warn( "Gateway token unset. Visit your gateway Settings -> Developer -> Create local authorization" )
      return
    }
    this.tick = AFRAME.utils.throttleTick(this.tick, 500, this);
  },
  tick: function(t, dt){  
    if ( !token || token.length < 10 ) { return }  
    fetch(baseURL + 'things/http---localhost-58888-/properties/Color', {
      headers: {
        Accept: 'application/json',
        Authorization: token
      }
    }).then(res => {
      return res.json();
    }).then(things => {
      if (debug) console.log(things);
      this.el.setAttribute("color", things.Color);
    });
  }
 })
  
AFRAME.registerComponent('iot-color-actuator', {
  // check which color to send
  init: function () {
    if ( !token || token.length < 10 ) {
      console.warn( "Gateway token unset. Visit your gateway Settings -> Developer -> Create local authorization" )
      return
    }
    var leds = {
      blue: {
        url: 'things/gpio-13/properties/on',
        properties: [{ on: false}]
      },
      green: {
        url: 'things/gpio-19/properties/on',
        properties: [{ on: false }]
      },
      red: {
        url: 'things/gpio-26/properties/on',
        properties: [{ on: false }]
      }
    };
    var el = this.el
    var myColor, endpoint
    this.el.addEventListener('click', function (evt) {
      myColor = el.getAttribute('color')
      if (debug) console.log('color', myColor );
      let led = leds[myColor];
      led.properties[0].on = ! led.properties[0].on;
      fetch(baseURL + led.url, {
        method: "PUT", 
        headers: {
          Accept: 'application/json', // required!
          'Content-Type': 'application/json',
          Authorization: token
        },
        body: JSON.stringify(led.properties[0])
      }).then(res => {
        if (debug) console.log(res);
        return res.json();
      }).then(things => {
        if (debug) console.log(things)
      });

    });
  }
});

AFRAME.registerComponent('gateway-interface', {
  init: function () {
    if ( !token || token.length < 10 ) {
      console.warn( "Gateway token unset. Visit your gateway Settings -> Developer -> Create local authorization" )
      return
    }
    fetch(baseURL + 'things', {
      headers: {
        Accept: 'application/json',
        Authorization: token }
    }).then(res => {
      return res.json();
    }).then(things => {
      if (debug) console.log(things);
      var x = -( things.length * 3 / 2 )
      for (var thing of things){
        if (debug) console.log( thing );
        x += 3
        // https://github.com/gmarty/aframe-ui-components
        // https://github.com/caseyyee/aframe-ui-widgets
        // https://github.com/rdub80/aframe-gui
        var newEl = document.createElement( "a-sphere" )
        newEl.setAttribute( "position", x + " 0 -5" )
        newEl.setAttribute( "color", "lightblue" )
        var readwrite = true
        if ( readwrite ){
          var halo = document.createElement( "a-sphere" )
          halo.setAttribute( "radius", "1.2" )
          halo.setAttribute( "opacity", 0.2 )
          newEl.appendChild( halo )
        }
        var nameEl = document.createElement( "a-entity" )
        nameEl.setAttribute( "text", "value", thing.name )
        nameEl.setAttribute( "scale", "3 3 3" )
        nameEl.setAttribute( "position", "-1 1 0" )
        newEl.appendChild( nameEl )
        AFRAME.scenes[0].appendChild( newEl )
      }
    });
  }
});