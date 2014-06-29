Installing the Grapher
===

```
git clone https://github.com/chriswiggins/mikrotik-traffic-grapher.git
cd mikrotik-traffic-grapher
npm install
```

At the top of app.js, you'll find some variables to modify. Change them as necessary then run app.js

```
var updateInteval = 1; //Interval time in minutes
var interfaceName = 'pppoe-out1';
var host = '10.1.1.254';
var username = 'grapher';
var password = 'grapher';
```

If you're running this behind a proxy, then you'll want to enable the basename parameter at the top too.